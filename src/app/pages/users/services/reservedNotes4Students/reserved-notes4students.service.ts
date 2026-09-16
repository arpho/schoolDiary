import { inject, Injectable } from '@angular/core';
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
import { ReservedNotes4student } from '../../models/reservedNotes4student';
import { signal } from '@angular/core';

/**
 * Servizio per la gestione delle note riservate sugli studenti.
 * Permette ai docenti di salvare note private visibili solo a loro.
 */
@Injectable({
  providedIn: 'root'
})
export class ReservedNotes4studentsService {
  /**
   * Recupera le note di uno studente per un docente specifico (one-shot).
   * @param _studentKey Chiave studente.
   * @param _ownerKey Chiave docente.
   * @returns Promise con array di note.
   */
  getNotesByStudentAndOwner(_studentKey: string, _ownerKey: string) {
    console.log("getting note by student and owner");
    console.log("studentKey", _studentKey);
    console.log("ownerKey", _ownerKey);
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const q = this.queryFn(
      collectionRef,
      this.whereFn('ownerKey', '==', _ownerKey),
      this.whereFn('studentKey', '==', _studentKey)
    );
    return this.getDocsFn(q).then((querySnapshot) => {
      const notes: ReservedNotes4student[] = [];
      querySnapshot.forEach((docSnap) => {
        notes.push(new ReservedNotes4student(docSnap.data()).setKey(docSnap.id));
      });
      console.log("notes", notes);
      return notes;
    });
  }
  private notesOnCache = signal<ReservedNotes4student[]>([]);
  private collectionName = 'reservedNotes4Student';
  private firestore = inject(Firestore);

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
    // No initialization needed here
  }

  ngOnInit(): void {
    // Already initialized in constructor
  }

  /**
   * Cerca una nota nella cache.
   * @param noteKey Chiave nota.
   * @returns Nota o undefined.
   */
  fetchNoteOnCache(noteKey: string): ReservedNotes4student | undefined {
    return this.notesOnCache().find(note => note.key === noteKey);
  }

  /**
   * Recupera le note di note di uno studente per un proprietario.
   * @param ownerKey Chiave proprietario.
   * @param studentKey Chiave studente.
   * @returns Promise con note.
   */
  fetchNotes(ownerKey: string, studentKey: string): Promise<ReservedNotes4student[]> {
    return new Promise((resolve) => {
      this.getNotesOnRealtime(ownerKey, studentKey, (notes) => {
        resolve(notes);
      });
    });
  }

  /**
   * Aggiunge una nota riservata.
   * @param note Modello nota.
   * @returns Promise con il riferimento al documento.
   */
  async addNote(note: ReservedNotes4student): Promise<DocumentReference<DocumentData>> {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    return this.addDocFn(collectionRef, note.serialize());
  }

  /**
   * Aggiorna una nota riservata.
   * @param noteKey Chiave nota.
   * @param note Dati aggiornati.
   * @returns Promise vuota.
   */
  async updateNote(noteKey: string, note: ReservedNotes4student): Promise<void> {
    const docRef = this.docFn(this.firestore, this.collectionName, noteKey);
    return this.setDocFn(docRef, note.serialize());
  }

  /**
   * Elimina una nota riservata.
   * @param noteKey Chiave nota.
   * @returns Promise vuota.
   */
  async deleteNote(noteKey: string): Promise<void> {
    const docRef = this.docFn(this.firestore, this.collectionName, noteKey);
    return this.deleteDocFn(docRef);
  }

  /**
   * Recupera le note in tempo reale.
   * @param ownerKey Chiave proprietario.
   * @param studentKey Chiave studente.
   * @param callback Callback con le note.
   * @returns Unsubscribe function.
   */
  getNotesOnRealtime(ownerKey: string, studentKey: string, callback: (notes: ReservedNotes4student[]) => void) {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const q = this.queryFn(
      collectionRef,
      this.whereFn('ownerKey', '==', ownerKey),
      this.whereFn('studentKey', '==', studentKey)
    );
    return this.onSnapshotFn(q, (snapshot) => {
      const notes: ReservedNotes4student[] = [];
      snapshot.forEach((docSnap) => {
        notes.push(new ReservedNotes4student(docSnap.data()).setKey(docSnap.id));
      });
      callback(notes);
    });
  }
}
