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
  deleteDoc
} from '@angular/fire/firestore';
import { ClasseModel } from '../models/classModel';



@Injectable({
  providedIn: 'root'
})
export class ClassiService {
  fetchClasses(classes: string[]) {
    const classi = classes.map((classe) => this.fetchClasse(classe));
    return Promise.all(classi);

  }
  deleteClasse(key: string) {
    const docRef = doc(this.firestore, this.collection, key);
    return deleteDoc(docRef);
  }
  private firestore = inject(Firestore);
  collection = 'classi';

  async fetchClasse(classeKey: string) {
    const docRef = doc(this.firestore, this.collection, classeKey);
    const rawClasse = await getDoc(docRef);
    return new ClasseModel(rawClasse.data()).setKey(rawClasse.id);
  }

  addClasse(classe: ClasseModel) {
    const collectionRef = collection(this.firestore, this.collection);
    return addDoc(collectionRef, { ...classe });
  }

  updateClasse(classeKey: string, classe: ClasseModel) {
    const docRef = doc(this.firestore, this.collection, classeKey);
    return setDoc(docRef, { ...classe });
  }

  getClassiOnRealtime(callback: (classi: ClasseModel[]) => void) {
    const collectionRef = collection(this.firestore, this.collection);
    return onSnapshot(collectionRef, (snapshot) => {
      const classi: ClasseModel[] = [];
      snapshot.forEach((docSnap) => {
        classi.push(new ClasseModel(docSnap.data()).setKey(docSnap.id));
      });
      callback(classi);
    });
  }
}
