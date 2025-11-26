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
import { ClasseModel } from '../models/classModel';



@Injectable({
  providedIn: 'root'
})
export class ClassiService {
  fetchClasses4teacher(teacherKey: string) {

    return [];

  }
  classesOnCache = signal<ClasseModel[]>([]);

  constructor() {
    this.getClassiOnRealtime((classi) => {
      this.classesOnCache.set(classi);
    });
  }

  ngOnInit(): void {
    // Already initialized in constructor
  }

  async fetchClasseOnCache(classKey: string): Promise<ClasseModel> {
    console.log("getting classKey", classKey);
    let classe = this.classesOnCache().find(classe => classe.key === classKey);
    console.log("classe", classe);
    if (!classe) {
      console.log("classe non trovata in cache, cerco su firestore");
      classe = await this.fetchClasse(classKey);
      if (classe !== undefined) {
        this.classesOnCache.update(classi => [...classi, classe!]);
      }

    }
    return classe;
  }
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

  async archiviaClasse(classKey: string) {
    const classe = this.fetchClasseOnCache(classKey);
    if (!classe) {
      throw new Error('Classe non trovata');
    }

    const docRef = doc(this.firestore, this.collection, classKey);
    (await classe).archived = true;
    return setDoc(docRef, (await classe).serialize(), { merge: true });
  }

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
    onSnapshot(collectionRef, (snapshot) => {
      const classi: ClasseModel[] = [];
      snapshot.forEach((docSnap) => {
        classi.push(new ClasseModel(docSnap.data()).setKey(docSnap.id));
      });
      callback(classi);
    });
  }
}
