import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn
} from "@angular/common/http";
import { inject } from "@angular/core";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError, finalize } from "rxjs";
import { AuthService } from "../services/auth.service";
import { BYPASS_REFRESH_LOGIC } from "./skip.context";
import { Router } from "@angular/router";

// Biến global trong phạm vi file để quản lý trạng thái refresh giữa các request
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // 1. Kiểm tra nếu request được đánh dấu bỏ qua logic này (như API Refresh)
  if (req.context.get(BYPASS_REFRESH_LOGIC) === true) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  // 2. Gắn Token vào header nếu có và không phải request đăng nhập
  let authReq = req;
  if (token && !isAuthRequest) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 3. Xử lý lỗi 401 (Unauthorized)
      if (error.status === 401 && !isAuthRequest) {
        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
}

/**
 * Xử lý hàng đợi request khi đang refresh token
 */
const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Reset subject để các request sau phải đợi

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        const newToken = response.data.token;
        refreshTokenSubject.next(newToken); // Thông báo cho các request đang đợi
        return next(addTokenHeader(req, newToken));
      }),
      catchError((err) => {
        // Nếu refresh thất bại, xóa subject và logout
        refreshTokenSubject.next(null);
        const attempted = router.currentNavigation()?.finalUrl?.toString() || router.url;
        authService.logout('/login', attempted);
        // authService.logout('/login', router.url);

        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false; // Mở khóa để các đợt refresh sau có thể chạy
      })
    );
  } else {
    // 4. Nếu đang có một request refresh đang chạy, cho các request sau "xếp hàng"
    return refreshTokenSubject.pipe(
      filter(token => token !== null), // Chỉ cho đi qua khi đã có token mới
      take(1),                         // Lấy giá trị đầu tiên rồi đóng stream
      switchMap(token => next(addTokenHeader(req, token as string)))
    );
  }
}

/**
 * Helper gắn Bearer token vào header
 */
const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
