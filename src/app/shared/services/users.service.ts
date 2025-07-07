import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { getDatabase, onValue, push, ref, set } from 'firebase/database';
import { UserModel } from '../models/userModel';
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  db = getDatabase();
  collection = 'userProfile';

  constructor(
    private auth: Auth,

    private MyAuth: AuthService
  ) {}
  isUserAuthenticated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  getLoggedUser(): Promise<UserModel> {
    console.log('ciao user seervice');
    return new Promise((resolve, reject) => {
      this.MyAuth.getUser().subscribe(async (user) => {
        if (user) {
          const loggedUser = await this.getUserByUid(user.uid);
          resolve(loggedUser);
        }
      });
    });
  }

  async signupUser(user: UserModel) {
    const auth = getAuth();
    const createdUser = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    user.setKey(createdUser.user.uid);
    const userRef = ref(this.db, `${this.collection}/${user.key}`);
    const result = set(userRef, user.serialize());

    return result;
  }
  logout() {
    const auth = getAuth();
    console.log('auth', auth);
    auth.signOut();
  }

  getUserByUid(uid: string): Promise<UserModel> {
    const UsewrRef = ref(this.db, `userProfile/${uid}`);
    return new Promise((resolve, reject) => {
      onValue(UsewrRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const user = new UserModel(data).setKey(uid);
          resolve(user);
        } else {
          console.log('No user found');
          reject('no data found');
        }
      });
    });
  }
}
