import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';

/**
 * Interfaccia per i componenti che supportano il controllo delle modifiche non salvate.
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges: () => boolean;
}

/**
 * Guard che impedisce la navigazione se il componente ha modifiche non salvate.
 * Mostra un avviso di conferma all'utente.
 */
export const pendingChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {
  // Se il componente non supporta il controllo o non ha modifiche, procedi
  if (!component.hasUnsavedChanges || !component.hasUnsavedChanges()) {
    return true;
  }

  // Altrimenti, mostra l'avviso di conferma
  const alertController = inject(AlertController);
  const alert = await alertController.create({
    header: 'Modifiche non salvate',
    message: 'Hai delle modifiche non salvate. Sei sicuro di voler uscire? Le modifiche andranno perse.',
    buttons: [
      {
        text: 'Annulla',
        role: 'cancel',
      },
      {
        text: 'Esci senza salvare',
        role: 'destructive',
        handler: () => true
      },
    ],
  });

  await alert.present();

  // Attendiamo la decisione dell'utente
  const { role } = await alert.onDidDismiss();

  // Se l'utente ha scelto di uscire (role === 'destructive'), permetti la navigazione
  return role === 'destructive';
};
