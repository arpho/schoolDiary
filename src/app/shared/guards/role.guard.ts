import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { UsersRole } from '../models/usersRole';

/**
 * Guard per la gestione dell'accesso basato sui ruoli (RBAC).
 * Utilizza i Custom Claims di Firebase per verificare se l'utente ha i permessi necessari.
 * 
 * @param route La rotta attivata, deve contenere data.roles con l'array di UsersRole ammessi.
 * @param state Lo stato dell'attivazione.
 */
export const roleGuard: CanActivateFn = async (route, state) => {
  const usersService = inject(UsersService);
  const router = inject(Router);
  
  // Recuperiamo i ruoli permessi dai dati della rotta
  const allowedRoles = route.data?.['roles'] as UsersRole[];
  
  if (!allowedRoles || allowedRoles.length === 0) {
    console.warn(`roleGuard configurato sulla rotta ${state.url} ma senza ruoli specificati in data.roles`);
    return true; // Se non specificato, permettiamo l'accesso (comportamento di default)
  }

  // Recuperiamo i claims dell'utente loggato
  // getCustomClaims4LoggedUser restituisce un oggetto che contiene la proprietà 'role'
  const claims = await usersService.getCustomClaims4LoggedUser();
  const userRole = claims?.role;

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Se l'utente non ha i permessi, lo rimandiamo alla dashboard
  console.warn(`Accesso negato alla rotta ${state.url}. Ruoli ammessi: ${allowedRoles}, Ruolo utente rilevato: ${userRole}`);
  router.navigate(['/dashboard']);
  return false;
};
