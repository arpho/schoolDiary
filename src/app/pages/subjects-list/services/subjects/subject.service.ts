import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  DocumentData, 
  QueryConstraint, 
  orderBy 
} from '@angular/fire/firestore';
import { SubjectModel } from '../../models/subjectModel';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private orderByFn = orderBy;

  constructor() {
    // Inizializza la sottoscrizione al caricamento delle materie
    this.setupSubjectsListener();
  }

  /**
   * Crea una nuova materia
   * @param subject La materia da creare
   * @returns Promise che si risolve con l'ID del documento creato
   */
  async createSubject(subject: Omit<SubjectModel, 'key'>): Promise<string> {
    try {
      const docRef = doc(this.collectionFn(this.firestore, this.collectionName));
      const subjectWithTimestamps = {
        ...subject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await this.setDocFn(docRef, subjectWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione della materia:', error);
      throw error;
    }
  }

  /**
   * Aggiorna una materia esistente
   * @param key La chiave della materia da aggiornare
   * @param data I dati da aggiornare
   */
  async updateSubject(key: string, data: Partial<Omit<SubjectModel, 'key'>>): Promise<void> {
    try {
      const docRef = this.docFn(this.firestore, this.collectionName, key);
      await this.updateDocFn(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Errore durante l'aggiornamento della materia ${key}:`, error);
      throw error;
    }
  }

  /**
   * Elimina una materia
   * @param key La chiave della materia da eliminare
   */
  async deleteSubject(key: string): Promise<void> {
    try {
      const docRef = this.docFn(this.firestore, this.collectionName, key);
      await this.deleteDocFn(docRef);
    } catch (error) {
      console.error(`Errore durante l'eliminazione della materia ${key}:`, error);
      throw error;
    }
  }

  /**
   * Ottiene una materia per chiave
   * @param key La chiave della materia da ottenere
   * @returns Promise che si risolve con la materia richiesta o null se non trovata
   */
  async getSubjectByKey(key: string): Promise<SubjectModel | null> {
    try {
      const docRef = this.docFn(this.firestore, this.collectionName, key);
      const docSnap = await this.getDocFn(docRef);
      
      if (docSnap.exists()) {
        return new SubjectModel({ ...docSnap.data(), key: docSnap.id });
      }
      return null;
    } catch (error) {
      console.error(`Errore durante il recupero della materia ${key}:`, error);
      throw error;
    }
  }

  /**
   * Ottiene tutte le materie
   * @returns Promise che si risolve con l'array di tutte le materie
   */
  async getSubjects(): Promise<SubjectModel[]> {
    try {
      const querySnapshot = await this.getDocsFn(
        this.queryFn(
          this.collectionFn(this.firestore, this.collectionName),
          this.orderByFn('name')
        )
      );
      
      return querySnapshot.docs.map(doc => 
        new SubjectModel({ ...doc.data(), key: doc.id })
      );
    } catch (error) {
      console.error('Errore durante il recupero delle materie:', error);
      throw error;
    }
  }

  /**
   * Imposta il listener per le modifiche in tempo reale alle materie
   */
  private setupSubjectsListener(): void {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const q = this.queryFn(collectionRef, this.orderByFn('name'));

    this.onSnapshotFn(
      q,
      (snapshot) => {
        const subjects = snapshot.docs.map(doc => 
          new SubjectModel({ ...doc.data(), key: doc.id })
        );
        this.subjectsSubject.next(subjects);
      },
      (error) => {
        console.error('Errore durante la sottoscrizione alle materie:', error);
      }
    );
  }

  /**
   * Ottiene le materie in tempo reale come Observable
   * @returns Observable che emette l'array delle materie ad ogni aggiornamento
   */
  getSubjectsRealtime(): Observable<SubjectModel[]> {
    return this.subjects$;
  }

  /**
   * Filtra le materie in base a una query di ricerca
   * @param searchQuery La stringa di ricerca
   * @returns Promise che si risolve con le materie filtrate
   */
  async searchSubjects(searchQuery: string): Promise<SubjectModel[]> {
    try {
      const q = this.queryFn(
        this.collectionFn(this.firestore, this.collectionName),
        this.whereFn('name', '>=', searchQuery),
        this.whereFn('name', '<=', searchQuery + '\uf8ff')
      );

      const querySnapshot = await this.getDocsFn(q);
      return querySnapshot.docs.map(doc => 
        new SubjectModel({ ...doc.data(), key: doc.id })
      );
    } catch (error) {
      console.error('Errore durante la ricerca delle materie:', error);
      throw error;
    }
  }
}
