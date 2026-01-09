import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ClassiService } from './pages/classes/services/classi.service';
import { UsersService } from './shared/services/users.service';
import { ActivitiesService } from './pages/activities/services/activities.service';

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

  constructor(
    private router: Router,
    private classiService: ClassiService,
    private usersService: UsersService,
    private activitiesService: ActivitiesService
  ) { }

  ngOnInit() {
    this.setupAuthListener();
  }

  private setupAuthListener() {
    onAuthStateChanged(this.auth, (user) => {
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
      }
    });
  }
}
