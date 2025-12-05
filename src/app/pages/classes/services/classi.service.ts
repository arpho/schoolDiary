import { Injectable, inject, signal, OnDestroy } from '@angular/core';
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
import { SubscriptionService } from 'src/app/shared/services/subscription.service';
import { ClasseModel } from '../models/classModel';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ClassiService {
  getAllClasses() {
    return this.classesOnCache();
  }
  fetchClasses4teacher(teacherKey: string) {

    return [];

  }
  classesOnCache = signal<ClasseModel[]>([]);

  private subscriptionService = inject(SubscriptionService);
  private unsubscribeSnapshot?: Unsubscribe;

  constructor() {
    this.subscribeToClassiUpdates();
  }

  ngOnInit(): void {
    // Already initialized in constructor
  }

  async fetchClasseOnCache(classKey: string): Promise<ClasseModel> {
    let classe = this.classesOnCache().find(classe => classe.key === classKey);
    if (!classe) {
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

  async addClasse(classe: ClasseModel) {
    const docRef = doc(collection(this.firestore, this.collection));
    return setDoc(docRef, { ...classe });
  }

  updateClasse(classeKey: string, classe: ClasseModel) {
    const docRef = doc(this.firestore, this.collection, classeKey);
    return setDoc(docRef, { ...classe });
  }

  /**
   * Sottoscrive agli aggiornamenti in tempo reale delle classi
   * @param callback Funzione chiamata ad ogni aggiornamento con l'array delle classi
   * @returns Funzione per annullare la sottoscrizione
   */
  private subscribeToClassiUpdates() {
    const collectionRef = collection(this.firestore, this.collection);
    
    // Annulla eventuali sottoscrizioni precedenti
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    this.unsubscribeSnapshot = onSnapshot(
      collectionRef, 
      (snapshot) => {
        const classi: ClasseModel[] = [];
        snapshot.forEach((docSnap) => {
          classi.push(new ClasseModel(docSnap.data()).setKey(docSnap.id));
        });
        this.classesOnCache.set(classi);
      },
      (error) => {
        console.error('Errore durante la sottoscrizione alle classi:', error);
        // Potresti voler emettere un evento o gestire l'errore in altro modo
      }
    );
  }

  /**
   * Ottiene le classi in tempo reale con gestione degli errori
   * @param callback Funzione chiamata ad ogni aggiornamento
   * @returns Funzione per annullare la sottoscrizione
   */
  /**
   * Sottoscrive agli aggiornamenti in tempo reale delle classi
   * @param callback Funzione chiamata ad ogni aggiornamento con l'array delle classi
   * @returns Funzione per annullare la sottoscrizione
   */
  getClassiOnRealtime(callback: (classi: ClasseModel[]) => void): () => void {
    // Prima chiamata sincrona con i dati correnti
    callback([...this.classesOnCache()]);
    
    // Sottoscrizione agli aggiornamenti
    const subscription = this.subscriptionService.onDestroy$.subscribe(() => {
      callback([...this.classesOnCache()]);
    });
    
    // Restituisci una funzione per annullare la sottoscrizione
    return () => subscription.unsubscribe();
  }
}
