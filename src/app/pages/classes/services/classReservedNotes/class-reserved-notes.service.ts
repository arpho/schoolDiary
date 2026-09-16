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
  deleteDoc
} from '@angular/fire/firestore';
import { ReservedNotes4class } from '../../models/reservedNotes4class';

/**
 * Servizio per la gestione delle note riservate per classe.
 * Permette ai docenti di salvare appunti privati su studenti o classi.
 */
@Injectable({
  providedIn: 'root'
})
export class ClassReservedNotesService {
  private notesOnCache = signal<ReservedNotes4class[]>([]);

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

  constructor() {
    this.getNotesOnRealtime('', '', (notes: ReservedNotes4class[]) => {
      this.notesOnCache.set(notes);
    });
  }

  ngOnInit(): void {
    // Already initialized in constructor
  }

  /**
   * Recupera una nota dalla cache.
   * @param noteKey Chiave della nota.
   * @returns La nota se presente in cache, undefined altrimenti.
   */
  fetchNoteOnCache(noteKey: string): ReservedNotes4class | undefined {
    return this.notesOnCache().find(note => note.key === noteKey);
  }

  /**
   * Filtra le note in cache per proprietario (docente).
   * @param ownerKey Chiave del docente.
   * @returns Promise con array di note.
   */
  fetchNotes(ownerKey: string): Promise<ReservedNotes4class[]> {
    const notes = this.notesOnCache().filter(note => note.ownerKey === ownerKey);
    return Promise.resolve(notes);
  }

  protected getCollectionRef() {
    return this.collectionFn(this.firestore, this.collection);
  }

  protected getDocRef(key: string) {
    return this.docFn(this.firestore, this.collection, key);
  }

  deleteNote(key: string) {
    const docRef = this.getDocRef(key);
    return this.deleteDocFn(docRef);
  }

  private firestore = inject(Firestore);
  collection = 'reservedNotes4class';

  /**
   * Recupera una singola nota da Firebase.
   * @param noteKey Chiave della nota.
   * @returns Promise con il modello della nota.
   */
  async fetchNote(noteKey: string) {
    const docRef = this.getDocRef(noteKey);
    const rawNote = await this.getDocFn(docRef);
    return new ReservedNotes4class(rawNote.data()).setKey(rawNote.id);
  }

  /**
   * Aggiunge una nuova nota riservata.
   * @param note Modello della nota.
   * @returns Promise dell'operazione.
   */
  addNote(note: ReservedNotes4class) {
    console.log("creaing note", note.serialize())
    const collectionRef = this.getCollectionRef();
    return this.addDocFn(collectionRef, note.serialize());
  }

  /**
   * Aggiorna una nota esistente.
   * @param noteKey Chiave della nota.
   * @param note Dati aggiornati.
   * @returns Promise dell'operazione.
   */
  updateNote(noteKey: string, note: ReservedNotes4class) {
    const docRef = this.getDocRef(noteKey);
    return this.setDocFn(docRef, note.serialize());
  }

  /**
   * Sottoscrive alle note di un docente per una specifica classe.
   * @param ownerKey Chiave del docente.
   * @param classKey Chiave della classe.
   * @param callback Callback con la lista delle note.
   * @returns Unsubscribe function.
   */
  getNotesOnRealtime(ownerKey: string, classKey: string, callback: (notes: ReservedNotes4class[]) => void) {
    console.log("ownerKey", ownerKey);
    console.log("getting notes for class", classKey, "for user", ownerKey);
    const collectionRef = this.getCollectionRef();
    const q = this.queryFn(collectionRef, this.whereFn('ownerKey', '==', ownerKey), this.whereFn('classKey', '==', classKey));
    return this.onSnapshotFn(q, (snapshot) => {
      const notes: ReservedNotes4class[] = [];
      console.log(`notes for class ${classKey} for user ${ownerKey}`, snapshot);
      snapshot.forEach((docSnap) => {
        notes.push(new ReservedNotes4class(docSnap.data()).setKey(docSnap.id));
      });
      callback(notes);
    });
  }
}
