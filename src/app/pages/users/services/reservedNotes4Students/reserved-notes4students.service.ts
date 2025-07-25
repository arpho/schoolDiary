import { Injectable } from '@angular/core';
import { collection, addDoc, doc, setDoc, onSnapshot, query, where, DocumentReference, DocumentData } from 'firebase/firestore';
import { firestore } from 'src/app/shared/services/firebase.service';
import { ReservedNotes4student } from '../../models/reservedNotes4student';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservedNotes4studentsService {
  private notesOnCache = signal<ReservedNotes4student[]>([]);
  private collection = 'reservedNotes4Student';

  constructor() {
    this.getNotesOnRealtime('', '', (notes) => {
      this.notesOnCache.set(notes);
    });
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
    const collectionRef = collection(firestore, this.collection);
    return addDoc(collectionRef, note.serialize());
  }

  async updateNote(noteKey: string, note: ReservedNotes4student): Promise<void> {
    const docRef = doc(firestore, this.collection, noteKey);
    return setDoc(docRef, note.serialize());
  }

  getNotesOnRealtime(ownerKey: string, studentKey: string, callback: (notes: ReservedNotes4student[]) => void) {
    const collectionRef = collection(firestore, this.collection);
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
