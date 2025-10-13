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

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
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

  fetchActivities(teachersKey: string, classKey: string): Promise<ActivityModel[]> {
    try {
      const collectionRef = collection(this.firestore, this.collection);
      let q = query(collectionRef);
      q = query(q, where('teachersKey', '==', teachersKey));
      q = query(q, where('classKey', '==', classKey));
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

  async addActivity(activity: ActivityModel): Promise<DocumentReference<DocumentData>> {
    const collectionRef = collection(this.firestore, this.collection);
    return addDoc(collectionRef, activity.serialize());
  }

  async updateActivity(activityKey: string, activity: ActivityModel): Promise<void> {
    const docRef = doc(this.firestore, this.collection, activityKey);
    return setDoc(docRef, activity.serialize());
  }

  async deleteActivity(activityKey: string): Promise<void> {
    const docRef = doc(this.firestore, this.collection, activityKey);
    return deleteDoc(docRef);
  }

  getActivities4teacherOnRealtime(
    teachersKey: string,

    callback: (activities: ActivityModel[]) => void,
    queries?: QueryCondition[]
  ) {
    console.log("* fetching activities for teacher", teachersKey);
    console.log("* fetching activities with queries", queries);
    const collectionRef = collection(this.firestore, this.collection);
    let q = query(collectionRef, where('teacherKey', '==', teachersKey));

    if(queries) {
      queries.forEach((condition: QueryCondition) => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
      const activities: ActivityModel[] = [];
    onSnapshot(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        activities.push(new ActivityModel(docSnap.data()).setKey(docSnap.id));
        });
        callback(activities);
      });
  }     
}
