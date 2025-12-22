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
import { Subject } from 'rxjs';
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

  private unsubscribeSubject = new Subject<void>();
  private currentSubscription: (() => void) | null = null;

  fetchSubjectListOnRealTime(callback: (subjects: SubjectModel[]) => void, queries: QueryCondition[] = []): () => void {
    // Annulla la sottoscrizione precedente
    this.unsubscribeSubject.next();
    
    let q = query(collection(this.firestore, this.collectionName));
    if (queries.length > 0) {
      queries.forEach((condition: QueryCondition) => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    const subjects: SubjectModel[] = [];
    
    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        subjects.length = 0; // Svuota l'array mantenendo il riferimento
        snapshot.forEach((docSnap) => {
          subjects.push(new SubjectModel(docSnap.data()).setKey(docSnap.id));
        });
        callback([...subjects]); // Invia una copia dell'array
      },
      error: (error) => console.error("Error fetching subjects:", error)
    });

    // Salva la funzione di unsubscribe
    this.currentSubscription = unsubscribe;
    
    // Restituisci una funzione per annullare la sottoscrizione
    return () => {
      if (this.currentSubscription) {
        this.currentSubscription();
        this.currentSubscription = null;
      }
    };
  }

  async fetchSubject(subjectKey: string): Promise<SubjectModel | undefined> {
    const docRef = doc(this.firestore, this.collectionName, subjectKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return new SubjectModel(docSnap.data()).setKey(docSnap.id);
    }
    return undefined;
  }

  async fetchSubjectsByKeys(subjectKeys: string[]): Promise<SubjectModel[]> {
    const promises = subjectKeys.map(key => this.fetchSubject(key));
    const results = await Promise.all(promises);
    return results.filter((s): s is SubjectModel => s !== undefined);
  }

  updateSubject(subject: SubjectModel): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, subject.key);
    return setDoc(docRef, subject.serialize(), { merge: true });
  }

  deleteSubject(subjectKey: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, subjectKey);
    return deleteDoc(docRef);
  }

}
