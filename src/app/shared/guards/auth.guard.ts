import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';




export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (await authService.isUserLogged()) {
    console.log("user is logged");
    return true;
  } else {
    console.log("user is not logged");
    router.navigateByUrl("/login");
    return false;
  }
};
