import { Injectable, inject } from '@angular/core';
import { collection, doc, Firestore, setDoc, where,query, getDocs, addDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
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
import { UserModel } from '../models/userModel';
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private MyAuth = inject(AuthService);


  collection = 'userProfile';
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
    console.log("createdUser",createdUser)
    user.setKey(createdUser.user.uid);
const collectionRef = collection(this.firestore, this.collection)

const userRed = doc(collectionRef,user.key)
console.log("userRed",userRed)
    return setDoc(userRed,user.serialize());
  }
  logout() {
    const auth = getAuth();
    console.log('auth', auth);
    auth.signOut();
  }

  getUserByUid(uid: string): Promise<UserModel> {
    const UsewrRef = doc(this.firestore, `userProfile/${uid}`);
    return new Promise((resolve, reject) => {
      onSnapshot(UsewrRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
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
