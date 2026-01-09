import { Injectable, inject, signal } from '@angular/core';
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
    const collectionRef = collection(this.firestore, this.collection);
    let q = query(collectionRef);

    if (queries) {
      queries.forEach((condition: QueryCondition) => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }

    const activities: ActivityModel[] = [];
    const subscription = onSnapshot(q, (snapshot) => {
      activities.length = 0; // Clear the array while keeping the reference
      snapshot.forEach((docSnap) => {
        activities.push(new ActivityModel(docSnap.data()).setKey(docSnap.id));
      });
      callback([...activities]); // Return a new array reference to trigger change detection
    });

    return () => subscription; // Return an unsubscribe function
  }
  private activitiesOnCache = signal<ActivityModel[]>([]);
  private collection = 'activities';
  private firestore = inject(Firestore);
  private $users = inject(UsersService);

  constructor() {
    // Initialize real-time listener with empty parameters
    this.getActivities4teacherOnRealtime('', (activities: ActivityModel[]) => {
      this.activitiesOnCache.set(activities);
    });
  }

  async ngOnInit(): Promise<void> {
    const user = await this.$users.getLoggedUser();
    if (user) {
      this.getActivities4teacherOnRealtime(user.key, (activities: ActivityModel[]) => {
        this.activitiesOnCache.set(activities);
      });
    }
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
        const docRef = doc(this.firestore, this.collection, activityKey);
        const docSnap = await getDoc(docRef);

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
      const collectionRef = collection(this.firestore, this.collection);
      let q = query(collectionRef);
      q = query(q, where('teachersKey', '==', teachersKey));
      q = query(q, where('classKey', '==', classKey));
      q = query(q, orderBy('date', 'desc'));
      return getDocs(q).then(snapshot => {
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
      const docRef = doc(this.firestore, this.collection, activityKey);
      const docSnap = await getDoc(docRef);

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
    const collectionRef = collection(this.firestore, this.collection);
    const docref = await addDoc(collectionRef, activity.serialize());
    const docSnap = await getDoc(docref);
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
    const docRef = doc(this.firestore, this.collection, activityKey);
    return setDoc(docRef, activity.serialize());
  }

  /**
   * Elimina un'attività.
   * @param activityKey Chiave dell'attività da eliminare.
   * @returns Promise vuota.
   */
  async deleteActivity(activityKey: string): Promise<void> {
    const docRef = doc(this.firestore, this.collection, activityKey);
    return deleteDoc(docRef);
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
    const collectionRef = collection(this.firestore, this.collection);
    let q = query(collectionRef, where('teacherKey', '==', teachersKey), orderBy('date', 'desc'));
    console.log("queries", queries)
    if (queries) {
      queries.forEach((condition: QueryCondition) => {
        console.log("condition", condition);
        console.log(condition.field, condition.operator, condition.value);
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    const activities: ActivityModel[] = [];
    return onSnapshot(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        activities.push(new ActivityModel(docSnap.data()).setKey(docSnap.id));
      });
      callback(activities);
    });
  }
}
