import { Injectable, OnInit, inject, signal } from '@angular/core';
import { Observable, Observer } from 'rxjs';
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
  updatePassword,
  User,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { UserModel } from '../models/userModel';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ClassiService } from '../../../app/pages/classes/services/classi.service';  
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { QueryCondition } from '../models/queryCondition';
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
export class UsersService  implements OnInit{

  private usersCache = new Map<string, UserModel>();

  updatePassword(user: User, newPassword: string) {
    return updatePassword(user, newPassword)

  }

  async getUser(userKey: string): Promise<UserModel | null> {
    // Prima verifica nella cache
    const cachedUser = this.usersCache.get(userKey);
    if (cachedUser) {
      return cachedUser;
    }

    try {
      const docRef = doc(this.firestore, 'users', userKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data() as UserModel;
        userData.key = userKey;
        // Aggiungi alla cache
        this.usersCache.set(userKey, userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Errore nel caricamento dell\'utente:', error);
      return null;
    }
  }

  sendPasswordRecoverEmail(email: string): Promise<boolean> {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error('Errore durante l"invio dell\'email di recupero:', error);
        return false;
      });
  }

  usersOnCache=signal<UserModel[]>([]);
  getUsersByClass(classKey: string, callback: (users: UserModel[]) => void, queryConditions?: QueryCondition[]) {
    console.log("getUsersByClass*", classKey);
    const collectionRef = collection(this.firestore, this.collection);
    const queryRef = query(collectionRef, where('classKey', '==', classKey), ...queryConditions?.map((condition) => condition.toWhere()) || []);
    return onSnapshot(queryRef, (snapshot) => {
      const users: UserModel[] = [];
      snapshot.forEach((doc) => {
        const user = new UserModel(doc.data()).setKey(doc.id);
        const  classes:ClasseModel[] = [];
        user.classes?.forEach((classKey:string) => {
          console.log("fetching classModel in usersService", classKey);
        const classe = this.$classes.fetchClasseOnCache(classKey);
        if(classe){
          classes.push(classe);
        }
        });
        user.classi = classes;
        users.push(user);
      });
      callback(users);
    });
  }
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private MyAuth = inject(AuthService);
  private collection = 'userProfile';

  constructor(
    private $classes: ClassiService
  ) {
    console.log("UsersService constructor");
this.getUsersOnRealTime((users)=>{
  this.usersOnCache.set(users);
})
  }
  ngOnInit(): void {
    this.getUsersOnRealTime((users)=>{
      this.usersOnCache.set(users);
    })
  }

  fetchUserOnCache(userKey: string): UserModel | undefined {
    return this.usersOnCache().find(user => user.key === userKey);
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
    console.log("serialized user", user.serialize());
    return setDoc(userRef, user.serialize());
  }

  getUsersOnRealTime(cb: (users: UserModel[]) => void) {
    const collectionRef = collection(this.firestore, this.collection);
    onSnapshot(collectionRef, (snapshot) => {
      const  classes:ClasseModel[] = [];
      const users: UserModel[] = [];
      snapshot.forEach((doc) => {
        const user = new UserModel(doc.data()).setKey(doc.id);
        user.classes?.forEach((classKey:string) => {
        const classe = this.$classes.fetchClasseOnCache(classKey);
        if(classe)
        classes.push(classe);
        });
        user.classi = classes;
        users.push(user);
        this.usersCache.set(user.key, user);
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

  async createUser(user: UserModel): Promise<string> {
    const functions = getFunctions();
    const createUser = httpsCallable(functions, 'createUserPlus');
    const result = await createUser(user) as ClaimsResponse;
    console.log('createUser response:', result);
    if (result.data?.result !== 'ok') {
      console.error('createUser failed:', result);
      console.error('createUser failed:', user);
      throw new Error('Failed to create user: ' + (result.message || 'Unknown error'));
    }
    console.log('createUser successfully set:', result.data);
    return result.data.userKey;
  }

  

  /**
   * Registra un nuovo utente nel sistema con autenticazione Firebase e lo salva nel database Firestore.
   * @param {UserModel} user - L'oggetto utente da registrare, contenente email e password.
   * @returns {Promise<string>} Una Promise che si risolve con l'UID dell'utente appena creato.
   * @throws {Error} Se la creazione dell'utente fallisce o se si verifica un errore durante il salvataggio.
   * 
   * @example
   * const user = new UserModel({
   *   email: 'esempio@scuola.it',
   *   password: 'password123',
   *   // ... altri campi utente
   * });
   * 
   * try {
   *   const userId = await usersService.signupUser(user);
   *   console.log('Utente creato con ID:', userId);
   * } catch (error) {
   *   console.error('Errore durante la registrazione:', error);
   * }
   */
  async signupUser(user: UserModel): Promise<string> {
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
    return createdUser.user.uid;
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
