import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as number[];

  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = currentUser.role;
  console.log(currentUser);
  console.log(`User role is ${userRole}`);

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  alert('You do not have permission to view this page.');

  if (userRole == 3) {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/home']);
  }

  return false;
}
