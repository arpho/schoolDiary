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
/**
 * Servizio per la gestione dell'autenticazione tramite @angular/fire.
 * Gestisce login, logout, stato utente e reset password.
 */
export class AuthService {
  private afAuth = inject(AngularFireAuth);
  private http = inject(HttpClient);

  /*   async googleLogin(): Promise<void> {
      const provider = new firebase.auth.GoogleAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      await this.sendTokenToBackend(credential.user as firebase.User); // Ensure type is correctly cast
    } */
  /**
   * Effettua il logout dell'utente corrente.
   * @returns Promise che si risolve al termine del logout.
   */
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
  /**
   * Restituisce un Observable dello stato di autenticazione dell'utente.
   * @returns Observable che emette l'utente Firebase o null.
   */
  getUser(): Observable<firebase.User | null> {

    this.afAuth.authState.subscribe((user) => {
    });

    return this.afAuth.authState;
  }

  private async sendTokenToBackend(user: firebase.User | null) {
    if (user) {
      const idToken = await user.getIdToken();
      await firstValueFrom(this.http.post(`${environment.backendUrl}/api/auth/login`, { idToken }));
    }
  }

  /**
   * Verifica se un utente è loggato in modo asincrono.
   * @returns Promise che restituisce true se l'utente è loggato, false altrimenti.
   */
  isUserLogged() {
    return new Promise((resolve, reject) => {
      this.getUser().subscribe((user) => {
        if (user) {
          console.log("user is logged", user);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * Invia una email per il reset della password.
   * @param email Indirizzo email dell'utente.
   * @returns Promise che si risolve all'invio dell'email.
   */
  sendPasswordResetEmail(email: string): Promise<void> { // Add this method
    return this.afAuth.sendPasswordResetEmail(email);
  }
}