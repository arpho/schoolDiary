import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ClassiService } from './pages/classes/services/classi.service';
import { UsersService } from './shared/services/users.service';
import { ActivitiesService } from './pages/activities/services/activities.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private classiService: ClassiService,
    private usersService: UsersService,
    private activitiesService: ActivitiesService
  ) {}

  ngOnInit() {
    this.setupAuthListener();
  }

  private setupAuthListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
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
