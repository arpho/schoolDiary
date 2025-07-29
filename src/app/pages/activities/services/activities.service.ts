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
    this.getActivitiesOnRealtime('', (activities: ActivityModel[]) => {
      this.activitiesOnCache.set(activities);
    });
  }

  async ngOnInit(): Promise<void> {
  const user = await this.$users.getLoggedUser();
  if (user) {
    this.getActivitiesOnRealtime(user.key, (activities: ActivityModel[]) => {
      this.activitiesOnCache.set(activities);
    });
  }
}

  fetchActivityOnCache(activityKey: string): ActivityModel | undefined {
    return this.activitiesOnCache().find(activity => activity.key === activityKey);
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

  getActivitiesOnRealtime(
    teachersKey: string,
    callback: (activities: ActivityModel[]) => void,
    queries?: QueryCondition[]
  ) {
    console.log("teachersKey", teachersKey);
    console.log("queries", queries);
    const collectionRef = collection(this.firestore, this.collection);
    let q = query(collectionRef, where('teacherKey', '==', teachersKey));
    if (queries) {
      queries.forEach((condition: QueryCondition) => {
        console.log("condition", condition);
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
      const activities: ActivityModel[] = [];
    onSnapshot(q, (snapshot) => {
      console.log("snapshot", snapshot);
      console.log("snapshot.docs", snapshot.docs);
      snapshot.forEach((docSnap) => {
        console.log("docSnap", docSnap);
        activities.push(new ActivityModel(docSnap.data()).setKey(docSnap.id));
        });
        callback(activities);
      });
  }     
}
