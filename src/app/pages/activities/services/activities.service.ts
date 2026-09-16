import { Injectable, inject, signal } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  where,
  query,
  getDocs,
  addDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  QuerySnapshot,
  DocumentReference,
  DocumentData,
  QueryConstraint,
  WhereFilterOp,
  OrderByDirection,
  Query,
  orderBy,
  limit
} from '@angular/fire/firestore';
import { ActivityModel } from '../models/activityModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { UsersService } from 'src/app/shared/services/users.service';

/**
 * Servizio per la gestione delle attività (compiti, verifiche, note).
 * Gestisce le operazioni CRUD su Firestore e la sincronizzazione in tempo reale.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  /**
   * Sottoscrive agli aggiornamenti in tempo reale delle attività.
   * @param callback Funzione chiamata ad ogni aggiornamento della lista.
   * @param queries Condizioni di filtro opzionali.
   * @returns Funzione di unsubscribe.
   */
  fetchActivitiesOnRealTime(callback: (activities: ActivityModel[]) => void, queries?: QueryCondition[]) {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    let q = this.queryFn(collectionRef);

    if (queries) {
      queries.forEach((condition: QueryCondition) => {
        q = this.queryFn(q, this.whereFn(condition.field, condition.operator, condition.value));
      });
    }

    const activities: ActivityModel[] = [];
    const subscription = this.onSnapshotFn(q, (snapshot) => {
      activities.length = 0; // Clear the array while keeping the reference
      snapshot.forEach((docSnap) => {
        activities.push(new ActivityModel(docSnap.data()).setKey(docSnap.id));
      });
      callback([...activities]); // Return a new array reference to trigger change detection
    });

    return () => subscription; // Return an unsubscribe function
  }
  private activitiesOnCache = signal<ActivityModel[]>([]);
  private collectionName = 'activities';
  private firestore = inject(Firestore);
  private $users = inject(UsersService);

  // Store Firebase API functions to avoid injection context warnings and allow mocking in tests
  private collectionFn = collection;
  private queryFn = query;
  private whereFn = where;
  private getDocsFn = getDocs;
  private addDocFn = addDoc;
  private onSnapshotFn = onSnapshot;
  private getDocFn = getDoc;
  private setDocFn = setDoc;
  private deleteDocFn = deleteDoc;
  private docFn = doc;
  private orderByFn = orderBy;

  private unsubscribeSnapshot?: () => void;

  constructor() {
    const auth = inject(Auth);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Clean up previous subscription if any
        if (this.unsubscribeSnapshot) {
          this.unsubscribeSnapshot();
        }
        
        const loggedUser = await this.$users.getLoggedUser();
        if (loggedUser) {
          this.unsubscribeSnapshot = this.getActivities4teacherOnRealtime(loggedUser.key, (activities: ActivityModel[]) => {
            this.activitiesOnCache.set(activities);
          });
        }
      } else {
        this.activitiesOnCache.set([]);
        if (this.unsubscribeSnapshot) {
          this.unsubscribeSnapshot();
          this.unsubscribeSnapshot = undefined;
        }
      }
    });
  }

  /**
   * Recupera un'attività dalla cache o da Firebase.
   * @param activityKey Chiave dell'attività.
   * @returns Promise con il modello dell'attività.
   */
  async fetchActivityOnCache(activityKey: string): Promise<ActivityModel | undefined> {
    // Cerca prima in cache
    let activity = this.activitiesOnCache().find(activity => activity.key === activityKey);

    // Se non trovata in cache, recupera da Firebase
    if (!activity) {
      try {
        const docRef = this.docFn(this.firestore, this.collectionName, activityKey);
        const docSnap = await this.getDocFn(docRef);

        if (docSnap.exists()) {
          // Crea l'attività dai dati di Firebase
          activity = new ActivityModel();
          activity.build(docSnap.data());
          activity.setKey(docSnap.id);

          // Aggiorna la cache con la nuova attività
          this.activitiesOnCache.update(activities => [...activities, activity!]);
        }
      } catch (error) {
        console.error('Error fetching activity from Firebase:', error);
        throw error;
      }
    }

    return activity;
  }

  /**
   * Recupera le attività filtrate per docente e classe.
   * @param teachersKey Chiave del docente.
   * @param classKey Chiave della classe.
   * @returns Promise con la lista delle attività.
   */
  fetchActivities(teachersKey: string, classKey: string): Promise<ActivityModel[]> {
    try {
      const collectionRef = this.collectionFn(this.firestore, this.collectionName);
      let q = this.queryFn(collectionRef);
      q = this.queryFn(q, this.whereFn('teachersKey', '==', teachersKey));
      q = this.queryFn(q, this.whereFn('classKey', '==', classKey));
      q = this.queryFn(q, this.orderByFn('date', 'desc'));
      return this.getDocsFn(q).then(snapshot => {
        return snapshot.docs.map(docSnap => {
          const activity = new ActivityModel();
          activity.build(docSnap.data());
          activity.setKey(docSnap.id);
          return activity;
        });
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Recupera un'attività specifica dal database
   * @param activityKey - La chiave univoca dell'attività
   * @returns Una Promise che si risolve con l'oggetto ActivityModel o undefined se non trovato
   */
  async getActivity(activityKey: string): Promise<ActivityModel | undefined> {
    try {
      // Cerca prima nella cache
      const cachedActivity = this.activitiesOnCache().find(a => a.key === activityKey);
      if (cachedActivity) {
        return cachedActivity;
      }

      // Se non trovato in cache, cerca nel database
      const docRef = this.docFn(this.firestore, this.collectionName, activityKey);
      const docSnap = await this.getDocFn(docRef);

      if (docSnap.exists()) {
        const activity = new ActivityModel();
        activity.build(docSnap.data());
        activity.setKey(docSnap.id);

        // Aggiorna la cache
        this.activitiesOnCache.update(activities => [...activities, activity]);

        return activity;
      }

      return undefined;
    } catch (error) {
      console.error('Error getting activity:', error);
      throw error;
    }
  }

  /**
   * Crea una nuova attività.
   * @param activity Modello dell'attività da creare.
   * @returns Promise con l'attività creata (inclusa la chiave generata).
   */
  async addActivity(activity: ActivityModel): Promise<ActivityModel> {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const docref = await this.addDocFn(collectionRef, activity.serialize());
    const docSnap = await this.getDocFn(docref);
    const newActivity = new ActivityModel(docSnap.data()).setKey(docSnap.id);
    this.activitiesOnCache.update(activities => [...activities, newActivity]);
    return newActivity.setKey(docSnap.id);
  }

  /**
   * Aggiorna un'attività esistente.
   * @param activityKey Chiave dell'attività.
   * @param activity Dati aggiornati.
   * @returns Promise vuota.
   */
  async updateActivity(activityKey: string, activity: ActivityModel): Promise<void> {
    const docRef = this.docFn(this.firestore, this.collectionName, activityKey);
    return this.setDocFn(docRef, activity.serialize());
  }

  /**
   * Elimina un'attività.
   * @param activityKey Chiave dell'attività da eliminare.
   * @returns Promise vuota.
   */
  async deleteActivity(activityKey: string): Promise<void> {
    const docRef = this.docFn(this.firestore, this.collectionName, activityKey);
    return this.deleteDocFn(docRef);
  }

  /**
   * Recupera le attività di un docente in tempo reale.
   * @param teachersKey Chiave del docente.
   * @param callback Callback con la lista delle attività.
   * @param queries Filtri opzionali.
   * @returns Unsubscribe function.
   */
  getActivities4teacherOnRealtime(
    teachersKey: string,
    callback: (activities: ActivityModel[]) => void,
    queries?: QueryCondition[]
  ) {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    let q = this.queryFn(collectionRef, this.whereFn('teacherKey', '==', teachersKey), this.orderByFn('date', 'desc'));
    if (queries) {
      queries.forEach((condition: QueryCondition) => {
        q = this.queryFn(q, this.whereFn(condition.field, condition.operator, condition.value));
      });
    }
    const activities: ActivityModel[] = [];
    return this.onSnapshotFn(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        activities.push(new ActivityModel(docSnap.data()).setKey(docSnap.id));
      });
      callback(activities);
    });
  }
}
