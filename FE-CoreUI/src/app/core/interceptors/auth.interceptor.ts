import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { BYPASS_REFRESH_LOGIC } from "./skip.context";

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // 1. CHECK THE FLAG (Reliable)
  if (req.context.get(BYPASS_REFRESH_LOGIC) === true) {
    // This IS the refresh request. Pass it through without adding headers.
    return next(req);
  }

  // 2. Normal Request Logic
  const isAuthRequest = req.url.includes('/login') || req.url.includes('/register');
  let authReq = req;
  if (token && !isAuthRequest) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // 3. Handle 401
      if (error.status === 401) {
        // Since we already skipped the Refresh Logic above using the Context,
        // Any 401 arriving here MUST be from a normal API call (like getCategories).
        return handle401Error(authReq, next, authService);
      }

      return throwError(() => error);
    })
  );
}

const handle401Error = (req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.data.token);
        return next(addTokenHeader(req, response.data.token));
      }),
      catchError((err) => {
        // CRITICAL: If refresh fails, STOP. Logout.
        isRefreshing = false;

        if (err.status === 422 || err.status === 400) {
          return throwError(() => err);
        }

        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Wait for the other refresh to finish
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenHeader(req, token!)))
    );
  }
}

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
