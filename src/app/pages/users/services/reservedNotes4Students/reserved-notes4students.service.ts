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

@Injectable({
  providedIn: 'root'
})
export class ReservedNotes4studentsService {
  getNotesByStudentAndOwner(_studentKey: string, _ownerKey: string) {
    console.log("getting note by student and owner");
    console.log("studentKey", _studentKey);
    console.log("ownerKey", _ownerKey);
    const collectionRef = collection(this.firestore, this.collection);
    const q = query(
      collectionRef,
      where('ownerKey', '==', _ownerKey),
      where('studentKey', '==', _studentKey)
    );
    return getDocs(q).then((querySnapshot) => {
      const notes: ReservedNotes4student[] = [];
      querySnapshot.forEach((docSnap) => {
        notes.push(new ReservedNotes4student(docSnap.data()).setKey(docSnap.id));
      });
      console.log("notes", notes);
      return notes;
    });
  }
  private notesOnCache = signal<ReservedNotes4student[]>([]);
  private collection = 'reservedNotes4Student';
  private firestore = inject(Firestore);
  constructor() {
    // No initialization needed here
  }

  ngOnInit(): void {
    // Already initialized in constructor
  }

  fetchNoteOnCache(noteKey: string): ReservedNotes4student | undefined {
    return this.notesOnCache().find(note => note.key === noteKey);
  }

  fetchNotes(ownerKey: string, studentKey: string): Promise<ReservedNotes4student[]> {
    return new Promise((resolve) => {
      this.getNotesOnRealtime(ownerKey, studentKey, (notes) => {
        resolve(notes);
      });
    });
  }

  async addNote(note: ReservedNotes4student): Promise<DocumentReference<DocumentData>> {
    const collectionRef = collection(this.firestore, this.collection);
    return addDoc(collectionRef, note.serialize());
  }

  async updateNote(noteKey: string, note: ReservedNotes4student): Promise<void> {
    const docRef = doc(this.firestore, this.collection, noteKey);
    return setDoc(docRef, note.serialize());
  }

  async deleteNote(noteKey: string): Promise<void> {
    const docRef = doc(this.firestore, this.collection, noteKey);
    return deleteDoc(docRef);
  }

  getNotesOnRealtime(ownerKey: string, studentKey: string, callback: (notes: ReservedNotes4student[]) => void) {
    const collectionRef = collection(this.firestore, this.collection);
    const q = query(
      collectionRef,
      where('ownerKey', '==', ownerKey),
      where('studentKey', '==', studentKey)
    );
    return onSnapshot(q, (snapshot) => {
      const notes: ReservedNotes4student[] = [];
      snapshot.forEach((docSnap) => {
        notes.push(new ReservedNotes4student(docSnap.data()).setKey(docSnap.id));
      });
      callback(notes);
    });
  }
}
