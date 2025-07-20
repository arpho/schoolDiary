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
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ClaimsResponse {
  message?: string;
  data?: {
  result: 'ok' | 'error';
    userKey: string;
    claims: object;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private MyAuth = inject(AuthService);
  private collection = 'userProfile';

  constructor() {
    console.log('UsersService initialized');
  }

  fetchUser(userKey: string): Promise<UserModel | null> {
    const userRef = doc(this.firestore, `userProfile/${userKey}`);
    return getDoc(userRef).then((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        return new UserModel(data).setKey(userKey);
      } else {
        console.log('No user found');
        return null;
      }
    });
  }

  updateUser(userKey: string, user: UserModel): Promise<void> {
    const userRef = doc(this.firestore, `userProfile/${userKey}`);
    return setDoc(userRef, user.serialize());
  }

  getUsersOnRealTime(cb: (users: UserModel[]) => void) {
    const collectionRef = collection(this.firestore, this.collection);
    onSnapshot(collectionRef, (snapshot) => {
      const users: UserModel[] = [];
      snapshot.forEach((doc) => {
        const user = new UserModel(doc.data()).setKey(doc.id);
        users.push(user);
      });
      cb(users);
    });
  }

  isUserAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        resolve(!!user);
      });
    });
  }

  getCustomClaims4LoggedUser(): Promise<any> {
    return new Promise((resolve) => {
      const auth = getAuth();
      auth.currentUser?.getIdTokenResult(true).then((tokenResult) => {
        resolve(tokenResult.claims);
      });
    });
  }

  getLoggedUser(): Promise<UserModel | null> {
    return new Promise((resolve) => {
      this.MyAuth.getUser().subscribe(async (user) => {
        if (user) {
          const loggedUser = await this.getUserByUid(user.uid);
          resolve(loggedUser);
        } else {
          resolve(null);
        }
      });
    });
  }

  async setUserClaims2user(userKey: string, claims: object): Promise<void> {
    try {
      console.log('Setting claims for user:', userKey);
      console.log('claims:', claims);
      
      const functions = getFunctions();
      const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
      
      const result = await setCustomClaims({ userKey, claims}) as ClaimsResponse;
      console.log('Claims response:', result);
      
      if (result.data?.result !== 'ok') {
        console.error('Claims failed:', result);
        throw new Error('Failed to set custom claims: ' + (result.message || 'Unknown error'));
      }
      
      console.log('Claims successfully set:', result.data);
    } catch (error) {
      console.error('Error setting custom claims:', error);
      throw error;
    }
  }

  async signupUser(user: UserModel): Promise<void> {
    const auth = getAuth();
    const createdUser = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    console.log('createdUser', createdUser);
    
    if (!createdUser.user) {
      throw new Error('User creation failed');
    }

    user.setKey(createdUser.user.uid);
    const collectionRef = collection(this.firestore, this.collection);
    const userRef = doc(collectionRef, user.key);
    console.log('userRef', userRef);
    
    await setDoc(userRef, user.serialize());
  }

  logout(): Promise<void> {
    const auth = getAuth();
    console.log('auth', auth);
    return auth.signOut();
  }

  getUserByUid(uid: string): Promise<UserModel | null> {
    const userRef = doc(this.firestore, `userProfile/${uid}`);
    return new Promise((resolve) => {
      onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const user = new UserModel(data).setKey(uid);
          resolve(user);
        } else {
          console.log('No user found');
          resolve(null);
        }
      });
    });
  }
}
