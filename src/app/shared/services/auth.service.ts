import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Import the authentication module
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private afAuth = inject(AngularFireAuth);
  private http = inject(HttpClient);

/*   async googleLogin(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    await this.sendTokenToBackend(credential.user as firebase.User); // Ensure type is correctly cast
  } */
  async logout(): Promise<void> {
    await this.afAuth.signOut();
    //TODO inirtialize firebase
  }
/*   private async sendTokenToBackend(user: firebase.User | null) {
    if (user) {
      const idToken = await user.getIdToken();
      await firstValueFrom(this.http.post(`${environment.backendUrl}/api/auth/login`, { idToken }));
    }
  } */
  getUser(): Observable<firebase.User | null> {
    console.log("getting user");
    this.afAuth.authState.subscribe((user) => {
      console.log("user logged",user);
    });

    return this.afAuth.authState;
  }

  private async sendTokenToBackend(user: firebase.User | null) {
    if (user) {
      const idToken = await user.getIdToken();
      await firstValueFrom(this.http.post(`${environment.backendUrl}/api/auth/login`, { idToken }));
    }
  }

  isUserLogged(){
    return new Promise( (resolve, reject) => {
      this.getUser().subscribe( (user) => {
        if (user) {
          console.log( "user is logged", user );
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  sendPasswordResetEmail(email: string): Promise<void> { // Add this method
    return this.afAuth.sendPasswordResetEmail(email);
  }
}