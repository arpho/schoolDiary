import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { UsersRole } from '../models/usersRole';
import { AuthService } from '../services/auth.service';

/**
 * Guard per la verifica dell'ownership o del ruolo docente/amministratore.
 * Se l'utente è ADMIN o TEACHER, l'accesso è consentito.
 * Se l'utente è uno STUDENTE, può accedere solo se la rotta fa riferimento al proprio ID utente (:userKey o :studentKey).
 */
export const ownerOrRoleGuard: CanActivateFn = async (route, state) => {
  const usersService = inject(UsersService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLogged = await authService.isUserLogged();
  if (!isLogged) {
    router.navigate(['/login']);
    return false;
  }

  const claims = await usersService.getCustomClaims4LoggedUser();
  const userRole = claims?.role;

  // Docenti e Admin hanno accesso completo
  if (userRole === UsersRole.ADMIN || userRole === UsersRole.TEACHER) {
    return true;
  }

  // Per gli studenti, verifichiamo che il parametro corrisponda al proprio account
  const loggedUser = await usersService.getLoggedUser();
  if (!loggedUser) {
    router.navigate(['/login']);
    return false;
  }

  const targetKey = route.paramMap.get('userKey') || route.paramMap.get('studentKey');
  if (targetKey && targetKey === loggedUser.key) {
    return true;
  }

  console.warn(`Accesso negato: studente ${loggedUser.key} ha tentato di accedere a rotta per ${targetKey}`);
  router.navigate(['/dashboard']);
  return false;
};
