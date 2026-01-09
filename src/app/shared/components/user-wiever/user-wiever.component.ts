import { Component, input, signal, inject, effect } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { UserModel } from '../../models/userModel';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel } from "@ionic/angular/standalone";

/**
 * Componente per visualizzare i dettagli di un utente (studente o docente).
 * Recupera i dati dalla cache tramite chiave utente.
 */
@Component({
  selector: 'app-user-wiever',
  templateUrl: './user-wiever.component.html',
  styleUrls: ['./user-wiever.component.scss'],
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel],
})
export class UserWieverComponent {
  private usersService = inject(UsersService);
  /** Chiave dell'utente da visualizzare */
  userkey = input<string>();
  /** Signal con il modello dell'utente recuperato */
  user = signal<UserModel | undefined>(undefined);

  constructor() {
    effect(async () => {
      const userKey = this.userkey();
      if (userKey) {
        const user = await this.usersService.fetchUserOnCache(userKey);
        if (user instanceof UserModel) {
          this.user.set(user);
        }
      }
    })

  }



}
