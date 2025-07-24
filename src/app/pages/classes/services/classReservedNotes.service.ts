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
import { ReservedNotes4class } from '../models/reservedNotes4class';

@Injectable({
  providedIn: 'root'
})
export class ClassReservedNotesService {
  private notesOnCache = signal<ReservedNotes4class[]>([]);

  constructor() {
    this.getNotesOnRealtime((notes) => {
      this.notesOnCache.set(notes);
    });
  }

  ngOnInit(): void {
    // Already initialized in constructor
  }

  fetchNoteOnCache(noteKey: string): ReservedNotes4class | undefined {
    return this.notesOnCache().find(note => note.key === noteKey);
  }

  fetchNotes(ownerKey: string): Promise<ReservedNotes4class[]> {
    const notes = this.notesOnCache().filter(note => note.ownerKey === ownerKey);
    return Promise.resolve(notes);
  }

  deleteNote(key: string) {
    const docRef = doc(this.firestore, this.collection, key);
    return deleteDoc(docRef);
  }

  private firestore = inject(Firestore);
  collection = 'reservedNotes4class';

  async fetchNote(noteKey: string) {
    const docRef = doc(this.firestore, this.collection, noteKey);
    const rawNote = await getDoc(docRef);
    return new ReservedNotes4class(rawNote.data()).setKey(rawNote.id);
  }

  addNote(note: ReservedNotes4class) {
    const collectionRef = collection(this.firestore, this.collection);
    return addDoc(collectionRef, { ...note });
  }

  updateNote(noteKey: string, note: ReservedNotes4class) {
    const docRef = doc(this.firestore, this.collection, noteKey);
    return setDoc(docRef, { ...note });
  }

  getNotesOnRealtime(ownerKey: string, callback: (notes: ReservedNotes4class[]) => void) {
    const collectionRef = collection(this.firestore, this.collection);
    const q = query(collectionRef, where('ownerKey', '==', ownerKey));
    return onSnapshot(q, (snapshot) => {
      const notes: ReservedNotes4class[] = [];
      snapshot.forEach((docSnap) => {
        notes.push(new ReservedNotes4class(docSnap.data()).setKey(docSnap.id));
      });
      callback(notes);
    });
  }
}
