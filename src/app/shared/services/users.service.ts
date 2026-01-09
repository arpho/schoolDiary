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
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

interface ClaimsResponse {
  message?: string;
  data?: {
    result: 'ok' | 'error';
    userKey: string;
    claims: object;
  };
}

/**
 * Servizio principale per la gestione degli utenti (Studenti, Docenti, Admin).
 * Gestisce operazioni CRUD su Firestore, autenticazione e cache locale degli utenti.
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnInit {
  readonly usersCache = new Map<string, UserModel>();
  usersOnCache = signal<UserModel[]>([]);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private MyAuth = inject(AuthService);
  private $subjects = inject(SubjectService);
  private collectionName = 'userProfiles';

  // Store Firebase API functions to avoid injection context warnings
  private collectionFn = collection;
  private queryFn = query;
  private whereFn = where;
  private getDocsFn = getDocs;
  private addDocFn = addDoc;
  private onSnapshotFn = onSnapshot;
  private getDocFn = getDoc;
  private setDocFn = setDoc;
  private docFn = doc;

  // Store Auth functions to avoid injection context warnings
  private getAuthFn = getAuth;
  private sendPasswordResetEmailFn = sendPasswordResetEmail;
  private createUserWithEmailAndPasswordFn = createUserWithEmailAndPassword;
  private updatePasswordFn = updatePassword;

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

  /**
   * Aggiorna la password dell'utente.
   * @param user Utente Firebase.
   * @param newPassword Nuova password.
   * @returns Promise dell'operazione.
   */
  updatePassword(user: User, newPassword: string) {
    return this.updatePasswordFn(user, newPassword);
  }

  /**
   * Recupera un utente dalla cache o da Firestore.
   * @param userKey Chiave univoca dell'utente.
   * @returns Promise contenente il modello dell'utente o null se non trovato.
   */
  async getUser(userKey: string): Promise<UserModel | null> {
    // Check in cache first
    const cachedUser = this.usersCache.get(userKey);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, fetch from Firestore
    try {
      const docRef = this.docFn(this.firestore, 'userProfiles', userKey);
      const docSnap = await this.getDocFn(docRef);

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

  /**
   * Invia un'email per il recupero della password.
   * @param email Email dell'utente.
   * @returns Promise che restituisce true se l'invio ha successo, false altrimenti.
   */
  sendPasswordRecoverEmail(email: string): Promise<boolean> {
    const auth = this.getAuthFn();
    return this.sendPasswordResetEmailFn(auth, email)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error('Errore durante l"invio dell\'email di recupero:', error);
        return false;
      });
  }

  /**
   * Sottoscrizione realtime agli utenti di una specifica classe.
   * @param classKey Chiave della classe.
   * @param callback Callback invocata con la lista degli utenti aggiornata.
   * @param queryConditions Condizioni opzionali per filtrare ulteriormente.
   * @returns Funzione per cancellare la sottoscrizione (unsubscribe).
   */
  getUsersByClass(classKey: string, callback: (users: UserModel[]) => void, queryConditions: QueryCondition[] = []): () => void {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const conditions = [
      this.whereFn('classKey', '==', classKey),
      ...queryConditions.map(condition => condition.toWhere())
    ];

    const queryRef = this.queryFn(collectionRef, ...conditions);

    return this.onSnapshotFn(queryRef, async (snapshot) => {
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

        } else {
          user.assignedClasses = [];
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

  /**
   * Recupera un utente dalla cache signal, se non presente lo scarica da Firestore.
   * @param userKey Chiave dell'utente.
   * @returns Promise con il modello utente.
   */
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
      const docRef = this.docFn(this.firestore, 'userProfiles', userKey);
      const docSnap = await this.getDocFn(docRef);

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
        // user.assignedClases = classi.map(item=>new AssignedClass(item));
      } else {
        user.assignedClasses = [];
      }

      return user;
    } catch (error) {
      console.error(`Errore nel recupero dell'utente con ID ${userKey}:`, error);
      return null;
    }
  }

  /**
   * Aggiorna i dati di un utente su Firestore.
   * @param userKey Chiave dell'utente.
   * @param user Oggetto con i dati aggiornati.
   * @returns Promise void.
   */
  async updateUser(userKey: string, user: UserModel): Promise<void> {
    try {
      const userRef = this.docFn(this.firestore, 'userProfiles', userKey);
      await this.setDocFn(userRef, user.serialize(), { merge: true });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'utente:', error);
      throw error;
    }
  }

  /**
   * Sottoscrizione realtime a tutti gli utenti che soddisfano le condizioni.
   * @param cb Callback con la lista degli utenti.
   * @param queryConditions Condizioni AND.
   * @param orConditions Condizioni OR.
   * @returns Unsubscribe function.
   */
  getUsersOnRealTime(cb: (users: UserModel[]) => void, queryConditions?: QueryCondition[], orConditions?: OrCondition) {
    let q = this.queryFn(this.collectionFn(this.firestore, this.collectionName));
    if (queryConditions) {
      q = this.queryFn(q, ...queryConditions?.map((condition) => condition.toWhere()) || []);
    }
    if (orConditions) {
      q = this.queryFn(q, orConditions.toWhere());
      console.log("orConditions", orConditions);
    }
    const unsubscribe = this.onSnapshotFn(q, (querySnapshot) => {
      const users: UserModel[] = [];
      querySnapshot.forEach((doc) => {
        const user = new UserModel(doc.data()).setKey(doc.id);

        const classes: ClasseModel[] = [];
        user.classes?.forEach(async (classKey: string) => {
          const classe = await this.$classes.fetchClasseOnCache(classKey);
          if (classe) {
            classes.push(classe);
          }
        });



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
      const auth = this.getAuthFn();
      auth.currentUser?.getIdTokenResult(true).then((tokenResult) => {
        resolve(tokenResult.claims);
      });
    });
  }

  /**
   * Recupera l'utente attualmente loggato.
   * INCLUDE il recupero dei dettagli delle classi assegnate per i docenti.
   * @returns Promise con il modello dell'utente loggato.
   */
  getLoggedUser(): Promise<UserModel | null> {
    return new Promise((resolve) => {
      this.MyAuth.getUser().subscribe(async (user) => {
        if (user) {
          const loggedUser = await this.getUserByUid(user.uid);
          if (loggedUser) {
            if (loggedUser.assignedClasses && loggedUser.assignedClasses.length > 0) {
              const classesPromises = loggedUser.assignedClasses.map(async (classe: AssignedClass) => {
                const classeBase = await this.$classes.fetchClasseOnCache(classe.key);
                if (classeBase) {
                  return new AssignedClass({ ...classe, ...classeBase });
                }
                return new AssignedClass(classe);
              });
              loggedUser.assignedClasses = await Promise.all(classesPromises);
            }
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

  /**
   * Crea un utente tramite Cloud Function 'createUserPlus'.
   * @param user Utente da creare.
   * @returns Promise con l'ID del nuovo utente.
   */
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
    const auth = this.getAuthFn();
    const createdUser = await this.createUserWithEmailAndPasswordFn(
      auth,
      user.email,
      user.password
    );
    console.log('createdUser', createdUser);

    if (!createdUser.user) {
      throw new Error('User creation failed');
    }

    user.setKey(createdUser.user.uid);
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const userRef = this.docFn(collectionRef, user.key);
    console.log('userRef', userRef);

    await this.setDocFn(userRef, user.serialize());
    return createdUser.user.uid;
  }

  /**
   * Effettua il logout dell'utente.
   * @returns Promise del logout.
   */
  logout(): Promise<void> {
    const auth = this.getAuthFn();
    console.log('auth', auth);
    return auth.signOut();
  }

  /**
   * Recupera un utente dato il suo UID.
   * @param uid UID dell'utente.
   * @returns Promise con il modello utente o null.
   */
  async getUserByUid(uid: string): Promise<UserModel | null> {
    try {
      const userRef = this.docFn(this.firestore, `userProfiles/${uid}`);
      const snapshot = await this.getDocFn(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const user = new UserModel(data).setKey(uid);
        return user;
      } else {
        console.log('No user found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      return null;
    }
  }

  /**
   * Ritorna le materie insegnate da un docente in una classe specifica.
   * Verifica le classi assegnate al docente e le materie collegate.
   * @param teacherKey Chiave del docente.
   * @param classKey Chiave della classe.
   * @returns Promise con la lista delle materie.
   */
  async getSubjectsByTeacherAndClass(teacherKey: string, classKey: string): Promise<SubjectModel[]> {
    const teacher = await this.fetchUser(teacherKey);
    if (!teacher || !teacher.assignedClasses) {
      return [];
    }

    const assignedClass = teacher.assignedClasses.find(c => c.key === classKey);
    if (!assignedClass || !assignedClass.subjectsKey || assignedClass.subjectsKey.length === 0) {
      return [];
    }

    return this.$subjects.fetchSubjectsByKeys(assignedClass.subjectsKey);
  }
}
