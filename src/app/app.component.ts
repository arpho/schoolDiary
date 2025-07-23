import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ClassiService } from './pages/classes/services/classi.service';
import { UsersService } from './shared/services/users.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private classiService: ClassiService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.setupAuthListener();
  }

  private setupAuthListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Se l'utente non è autenticato, reindirizza alla pagina di login
        this.router.navigate(['/login']);
      }
      else{
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
