import { Injectable, OnInit, inject, signal } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { collection, doc, Firestore, setDoc, where, query, getDocs, addDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
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
import { OrCondition, QueryCondition } from '../models/queryCondition';

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
export class UsersService implements OnInit {
  readonly usersCache = new Map<string, UserModel>();
  usersOnCache = signal<UserModel[]>([]);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private MyAuth = inject(AuthService);
  private collection = 'userProfiles';

  constructor(
    private $classes: ClassiService
  ) {
    // TEMPORARY: Commentato per debug dipendenza circolare
    // // Initialize usersCache with all users
    // this.getUsersOnRealTime((users) => {
    //   this.usersOnCache.set(users);
    //   // Populate the usersCache Map
    //   users.forEach(user => {
    //     if (user.key) {
    //       this.usersCache.set(user.key, user);
    //     }
    //   });
    // });
  }

  updatePassword(user: User, newPassword: string) {
    return updatePassword(user, newPassword);
  }

  async getUser(userKey: string): Promise<UserModel | null> {
    // Check in cache first
    const cachedUser = this.usersCache.get(userKey);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, fetch from Firestore
    try {
      const docRef = doc(this.firestore, 'userProfiles', userKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = new UserModel(docSnap.data()).setKey(docSnap.id);
        // Add to cache
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

  getUsersByClass(classKey: string, callback: (users: UserModel[]) => void, queryConditions: QueryCondition[] = []): () => void {
    const collectionRef = collection(this.firestore, this.collection);
    const conditions = [
      where('classKey', '==', classKey),
      ...queryConditions.map(condition => condition.toWhere())
    ];
    
    const queryRef = query(collectionRef, ...conditions);
    
    return onSnapshot(queryRef, async (snapshot) => {
      const users: UserModel[] = [];
      
      for (const doc of snapshot.docs) {
        const user = new UserModel(doc.data()).setKey(doc.id);
        
        // Se l'utente ha classi multiple, le carichiamo
        if (user.classes && user.classes.length > 0) {
          const classiPromises = user.classes.map(async (classKey: string) => 
            this.$classes.fetchClasseOnCache(classKey) || 
            await this.$classes.fetchClasse(classKey)
          );
          
          const classi = (await Promise.all(classiPromises)).filter(Boolean) as ClasseModel[];
          user.classi = classi;
        } else {
          user.classi = [];
        }
        
        users.push(user);
      }
      
      callback(users);
    });
  }

  ngOnInit(): void {
    this.getUsersOnRealTime((users) => {
      this.usersOnCache.set(users);
    })
  }

  async fetchUserOnCache(userKey: string): Promise<UserModel | null> {
    if (!userKey) {
      console.warn('fetchUserOnCache chiamato con userKey vuoto');
      return null;
    }

    // Cerca prima nella cache
    const cachedUser = this.usersOnCache().find(user => user && user.key === userKey);
    
    if (cachedUser) {
      return cachedUser;
    }
    
    try {
      // Se non trovato in cache, cerca su Firestore
      const user = await this.fetchUser(userKey);
      
      if (user) {
        // Aggiorna la cache con l'utente appena recuperato
        this.usersOnCache.update(users => {
          // Evita duplicati
          if (!users.some(u => u.key === user.key)) {
            return [...users, user];
          }
          return users;
        });
      }
      
      return user;
    } catch (error) {
      console.error('Errore durante il recupero dell\'utente da Firestore:', error);
      return null;
    }
  }

  async fetchUser(userKey: string): Promise<UserModel | null> {
    if (!userKey) {
      console.warn('fetchUser chiamato con userKey vuoto');
      return null;
    }

    try {
      const docRef = doc(this.firestore, 'userProfiles', userKey);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn(`Utente con ID ${userKey} non trovato su Firestore`);
        return null;
      }

      const data = docSnap.data();
      if (!data) {
        console.warn(`Dati utente vuoti per l'ID ${userKey}`);
        return null;
      }

      const user = new UserModel(data as UserModel).setKey(docSnap.id);
      
      // Se l'utente ha classi, le carichiamo
      if (user.classes && user.classes.length > 0) {
        const classiPromises = user.classes.map(classKey => 
          this.$classes.fetchClasseOnCache(classKey) || 
          this.$classes.fetchClasse(classKey)
        );
        
        const classi = (await Promise.all(classiPromises)).filter(Boolean) as ClasseModel[];
        user.classi = classi;
      } else {
        user.classi = [];
      }
      
      return user;
    } catch (error) {
      console.error(`Errore nel recupero dell'utente con ID ${userKey}:`, error);
      return null;
    }
  }

  async updateUser(userKey: string, user: UserModel): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'userProfiles', userKey);
      await setDoc(userRef, user.serialize(), { merge: true });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'utente:', error);
      throw error;
    }
  }

  getUsersOnRealTime(cb: (users: UserModel[]) => void, queryConditions?: QueryCondition[], orConditions?: OrCondition) {
    let q = query(collection(this.firestore, this.collection));
    if (queryConditions) {
      q = query(q, ...queryConditions?.map((condition) => condition.toWhere()) || []);
    }
    if (orConditions) {
      q = query(q, orConditions.toWhere());
      console.log("orConditions", orConditions);
    }
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users: UserModel[] = [];
      querySnapshot.forEach((doc) => {
        const user = new UserModel(doc.data()).setKey(doc.id);

        const classes: ClasseModel[] = [];
        user.classes?.forEach((classKey: string) => {
          const classe = this.$classes.fetchClasseOnCache(classKey);
          if (classe) {
            classes.push(classe);
          }
        });

        user.classi = classes;

        users.push(user);
      });
      cb(users);
    });
    return unsubscribe;
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
          if (loggedUser) {
            const classes: ClasseModel[] = [];
            loggedUser.classes?.forEach((classKey: string) => {
              const classe = this.$classes.fetchClasseOnCache(classKey);
              if (classe) {
                classes.push(classe);
              }
            });

            loggedUser.classi = classes;
          }

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

      const result = await setCustomClaims({ userKey, claims }) as ClaimsResponse;
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
    const userRef = doc(this.firestore, `userProfiles/${uid}`);
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
