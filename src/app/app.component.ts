import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, ToastController } from '@ionic/angular/standalone';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ClassiService } from './pages/classes/services/classi.service';
import { UsersService } from './shared/services/users.service';
import { ActivitiesService } from './pages/activities/services/activities.service';
import { Messaging, getToken } from '@angular/fire/messaging';
import { environment } from 'src/environments/environment';

/**
 * Componente principale dell'applicazione.
 * Gestisce l'inizializzazione e il monitoraggio dello stato di autenticazione dell'utente per il routing automatico.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private auth = inject(Auth);
  private messaging = inject(Messaging);
  private swUpdate = inject(SwUpdate);
  private toastController = inject(ToastController);

  constructor(
    private router: Router,
    private classiService: ClassiService,
    private usersService: UsersService,
    private activitiesService: ActivitiesService
  ) { }

  ngOnInit() {
    this.setupAuthListener();
    this.checkUpdate();
  }

  private setupAuthListener() {
    onAuthStateChanged(this.auth, async (user) => {
      const currentUrl = this.router.url;

      // Allow access to reset-password page regardless of auth state
      if (currentUrl.includes('reset-password')) {
        return;
      }

      if (!user) {
        // Se l'utente non è autenticato, reindirizza alla pagina di login
        if (!currentUrl.includes('login')) {
          this.router.navigate(['/login']);
        }
      }
      else {
        // Se l'utente è autenticato, reindirizza alla dashboard
        if (!currentUrl.includes('dashboard')) {
          this.router.navigate(['/dashboard']);
        }

        try {
          // Request permission and get token
          const token = await getToken(this.messaging, {
            vapidKey: (environment.firebaseConfig as any).vapidKey
          });

          if (token) {
            console.log('FCM Token:', token);
            await this.usersService.updateUserFcmToken(user.uid, token);
          }
        } catch (error) {
          console.error('Error getting FCM token:', error);
        }
      }
    });
  }

  private checkUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(async () => {
        const toast = await this.toastController.create({
          message: 'È disponibile una nuova versione dell\'app!',
          buttons: [
            {
              text: 'Aggiorna',
              role: 'info',
              handler: () => {
                document.location.reload();
              }
            }
          ]
        });
        await toast.present();
      });
    }
  }
}
