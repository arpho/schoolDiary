import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  DocumentData,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';
import { ClasseModel } from '../models/classModel';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassiService {
  private firestore = inject(Firestore);
  private collectionName = 'classi';

  // Store Firebase API functions to avoid injection context warnings
  private collectionFn = collection;
  private queryFn = query;
  private whereFn = where;
  private getDocFn = getDoc;
  private getDocsFn = getDocs;
  private onSnapshotFn = onSnapshot;
  private setDocFn = setDoc;
  private updateDocFn = updateDoc;
  private deleteDocFn = deleteDoc;
  private docFn = doc;

  // BehaviorSubject per gestire lo stato delle classi
  private classesSubject = new BehaviorSubject<ClasseModel[]>([]);

  // Observable pubblico per le sottoscrizioni
  public classes$ = this.classesSubject.asObservable();

  private unsubscribeSnapshot?: Unsubscribe;

  constructor() {
    this.subscribeToClassiUpdates();
  }

  /**
   * Ottiene tutte le classi dalla cache
   */
  getAllClasses(): ClasseModel[] {
    return this.classesSubject.getValue();
  }

  /**
   * Placeholder per ottenere le classi di un insegnante
   */
  fetchClasses4teacher(teacherKey: string): ClasseModel[] {
    return [];
  }

  /**
   * Ottiene una classe dalla cache o la recupera dal database
   */
  async fetchClasseOnCache(classKey: string): Promise<ClasseModel> {
    let classe = this.classesSubject.getValue().find(c => c.key === classKey);
    if (!classe) {
      classe = await this.fetchClasse(classKey);
      if (classe !== undefined) {
        const currentClasses = this.classesSubject.getValue();
        this.classesSubject.next([...currentClasses, classe]);
      }
    }
    return classe;
  }

  /**
   * Recupera multiple classi
   */
  fetchClasses(classes: string[]): Promise<ClasseModel[]> {
    const classi = classes.map((classe) => this.fetchClasse(classe));
    return Promise.all(classi);
  }

  /**
   * Elimina una classe
   */
  deleteClasse(key: string): Promise<void> {
    const docRef = this.docFn(this.firestore, this.collectionName, key);
    return this.deleteDocFn(docRef);
  }

  /**
   * Archivia una classe
   */
  async archiviaClasse(classKey: string): Promise<void> {
    const classe = await this.fetchClasseOnCache(classKey);
    if (!classe) {
      throw new Error('Classe non trovata');
    }

    const docRef = this.docFn(this.firestore, this.collectionName, classKey);
    classe.archived = true;
    return this.setDocFn(docRef, classe.serialize(), { merge: true });
  }

  /**
   * Recupera una singola classe dal database
   */
  async fetchClasse(classeKey: string): Promise<ClasseModel> {
    const docRef = this.docFn(this.firestore, this.collectionName, classeKey);
    const rawClasse = await this.getDocFn(docRef);
    return new ClasseModel(rawClasse.data()).setKey(rawClasse.id);
  }

  /**
   * Aggiunge una nuova classe
   */
  async addClasse(classe: ClasseModel): Promise<void> {
    const docRef = this.docFn(this.collectionFn(this.firestore, this.collectionName));
    return this.setDocFn(docRef, { ...classe });
  }

  /**
   * Aggiorna una classe esistente
   */
  updateClasse(classeKey: string, classe: ClasseModel): Promise<void> {
    const docRef = this.docFn(this.firestore, this.collectionName, classeKey);
    return this.setDocFn(docRef, { ...classe });
  }

  /**
   * Sottoscrive agli aggiornamenti in tempo reale delle classi
   */
  private subscribeToClassiUpdates(): void {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);

    // Annulla eventuali sottoscrizioni precedenti
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    this.unsubscribeSnapshot = this.onSnapshotFn(
      collectionRef,
      (snapshot) => {
        const classi: ClasseModel[] = [];
        snapshot.forEach((docSnap) => {
          classi.push(new ClasseModel(docSnap.data()).setKey(docSnap.id));
        });
        this.classesSubject.next(classi);
      },
      (error) => {
        console.error('Errore durante la sottoscrizione alle classi:', error);
      }
    );
  }

  /**
   * Ottiene le classi in tempo reale come Observable
   * @returns Observable che emette l'array delle classi ad ogni aggiornamento
   */
  getClassiOnRealtime(): Observable<ClasseModel[]> {
    return this.classes$;
  }
}
