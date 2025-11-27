import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const isAuthRequest = req.url.includes('/login') || req.url.includes('/refresh') || req.url.includes('/register');

  let authReq = req;
  if (token && !isAuthRequest) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status == 401){

        if (req.url.includes('/refresh')){
          authService.logout();
          return throwError(() => error);
        }

        return handle401Error(authReq, next, authService);
      }

      return throwError(() => error);
    })
  );
}

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}`}
  });
}

const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.data.token);

        return next(addTokenHeader(request, response.data.token));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addTokenHeader(request, token!));
      })
    )
  }
}
