import { Injectable, inject } from '@angular/core';
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
  DocumentReference,
  DocumentData
} from '@angular/fire/firestore';
import { SubjectModel } from '../../models/subjectModel';
import { BehaviorSubject, Observable } from 'rxjs';
import { QueryCondition } from 'src/app/shared/models/queryCondition';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private firestore = inject(Firestore);
  private collectionName = 'subjects';

  // BehaviorSubject per gestire lo stato delle materie
  private subjectsSubject = new BehaviorSubject<SubjectModel[]>([]);
  public subjects$ = this.subjectsSubject.asObservable();

  // Store Firebase API functions to avoid injection context warnings


  constructor() {
    // Inizializza la sottoscrizione al caricamento delle materie

  }

   async createSubject(subject: SubjectModel): Promise<SubjectModel> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(collectionRef, subject.serialize());
    subject.key = docRef.id;
    return subject;

      
   }

   fetchSubjectListOnRealTime(callback: (subjects: SubjectModel[]) => void, queries?: QueryCondition[]) {
    const collectionRef = collection(this.firestore, this.collectionName);
    let q = query(collectionRef)
console.log("queries", queries)
    if (queries) {
      queries.forEach((condition: QueryCondition) => {
        console.log("condition", condition);
        console.log(condition.field, condition.operator, condition.value);
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    const subjects: SubjectModel[] = [];
   const subscription =  onSnapshot(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        subjects.push(new SubjectModel(docSnap.data()).setKey(docSnap.id));
      });
      callback(subjects);
    });
    return subscription;
    }

  updateSubject(subject: SubjectModel): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, subject.key);
    return setDoc(docRef, subject.serialize());
  }

  deleteSubject(subjectKey: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, subjectKey);
    return deleteDoc(docRef);
  }

}
