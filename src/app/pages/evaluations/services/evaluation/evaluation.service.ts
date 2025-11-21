import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  setDoc,
  where,
  query,
  getDocs,
  addDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
  DocumentData,
} from '@angular/fire/firestore';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { QueryCondition } from 'src/app/shared/models/queryCondition';

export interface EvaluationCount {
  averageGrade: number;
  evaluationscount: number;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private evaluationCache = new Map<string, Evaluation[]>();
  private loadingPromises = new Map<string, Promise<Evaluation[]>>();
  private firestore = inject(Firestore);
  private collection = 'valutazioni';

  private getCacheKey(studentKey: string, teacherKey: string, subjectKey?: string): string {
    const baseKey = `${studentKey}_${teacherKey}`;
    return subjectKey ? `${baseKey}_${subjectKey}` : baseKey;
  }

  private async fetchEvaluationsFromServer(
    studentKey: string,
    teacherKey: string,
    subjectKey?: string
  ): Promise<Evaluation[]> {
    const collectionRef = collection(this.firestore, this.collection);
    const conditions = [
      where('studentKey', '==', studentKey),
      where('teacherKey', '==', teacherKey)
    ];

    if (subjectKey) {
      conditions.push(where('subjectKey', '==', subjectKey));
    }

    const q = query(collectionRef, ...conditions);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      new Evaluation(doc.data()).setKey(doc.id)
    );
  }

  private updateCache(studentKey: string, teacherKey: string, evaluations: Evaluation[], subjectKey?: string): void {
    const cacheKey = this.getCacheKey(studentKey, teacherKey, subjectKey);
    this.evaluationCache.set(cacheKey, [...evaluations]);
  }

  private getFromCache(studentKey: string, teacherKey: string, subjectKey?: string): Evaluation[] | undefined {
    const cacheKey = this.getCacheKey(studentKey, teacherKey, subjectKey);
    return this.evaluationCache.get(cacheKey);
  }

  private invalidateCache(evaluation: Evaluation): void {
    if (evaluation.studentKey && evaluation.teacherKey) {
      // Invalida la cache con e senza subjectKey
      this.evaluationCache.delete(this.getCacheKey(evaluation.studentKey, evaluation.teacherKey));
      if (evaluation.subjectKey) {
        this.evaluationCache.delete(
          this.getCacheKey(evaluation.studentKey, evaluation.teacherKey, evaluation.subjectKey)
        );
      }
    }
  }

  private updateLocalCache(evaluation: Evaluation): void {
    if (!evaluation.studentKey || !evaluation.teacherKey) return;

    const keysToUpdate = [
      this.getCacheKey(evaluation.studentKey, evaluation.teacherKey)
    ];

    if (evaluation.subjectKey) {
      keysToUpdate.push(
        this.getCacheKey(evaluation.studentKey, evaluation.teacherKey, evaluation.subjectKey)
      );
    }

    keysToUpdate.forEach(key => {
      const cachedEvaluations = this.evaluationCache.get(key);
      if (cachedEvaluations) {
        const index = cachedEvaluations.findIndex(e => e.key === evaluation.key);
        if (index !== -1) {
          // Aggiorna esistente
          cachedEvaluations[index] = evaluation;
        } else {
          // Aggiungi nuovo
          cachedEvaluations.push(evaluation);
        }
        // Opzionale: riordinare se necessario, per ora lasciamo l'ordine di inserimento/aggiornamento
        // o manteniamo l'ordine originale se era ordinato dal server
      }
    });
  }

  async getEvaluation4studentAndTeacher(
    studentKey: string,
    teacherKey: string,
    callback: (evaluations: Evaluation[]) => void,
    subjectKey?: string
  ) {
    const cacheKey = this.getCacheKey(studentKey, teacherKey, subjectKey);

    // Se i dati sono in cache, li restituiamo subito
    const cachedData = this.getFromCache(studentKey, teacherKey, subjectKey);
    if (cachedData) {
      callback(cachedData);
    } else {
      // Se stiamo già caricando i dati, attendiamo che il caricamento sia completato
      if (!this.loadingPromises.has(cacheKey)) {
        this.loadingPromises.set(
          cacheKey,
          this.fetchEvaluationsFromServer(studentKey, teacherKey, subjectKey)
            .then(evaluations => {
              this.updateCache(studentKey, teacherKey, evaluations, subjectKey);
              return evaluations;
            })
            .finally(() => {
              this.loadingPromises.delete(cacheKey);
            })
        );
      }

      // Attendi il completamento del caricamento e poi esegui la callback
      this.loadingPromises.get(cacheKey)?.then(evaluations => {
        callback(evaluations);
      });
    }

    // Imposta l'ascolto per gli aggiornamenti in tempo reale
    return this.setupRealtimeUpdates(studentKey, teacherKey, callback, subjectKey);
  }

  private setupRealtimeUpdates(
    studentKey: string,
    teacherKey: string,
    callback: (evaluations: Evaluation[]) => void,
    subjectKey?: string
  ) {
    const collectionRef = collection(this.firestore, this.collection);
    const conditions = [
      where('studentKey', '==', studentKey),
      where('teacherKey', '==', teacherKey)
    ];

    if (subjectKey) {
      conditions.push(where('subjectKey', '==', subjectKey));
    }

    const q = query(collectionRef, ...conditions);

    return onSnapshot(q, (snapshot) => {
      const evaluations = snapshot.docs.map(doc =>
        new Evaluation(doc.data()).setKey(doc.id)
      );

      // Aggiorna la cache con i nuovi dati
      this.updateCache(studentKey, teacherKey, evaluations, subjectKey);

      // Esegui la callback con i dati aggiornati
      callback(evaluations);
    });
  }

  // Metodi per la gestione delle valutazioni
  async fetchEvaluation(evaluationKey: string): Promise<Evaluation> {
    const docRef = doc(this.firestore, this.collection, evaluationKey);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Valutazione non trovata');
    }
    return new Evaluation(docSnap.data()).setKey(docSnap.id);
  }

  async addEvaluation(evaluation: Evaluation) {
    const docRef = await addDoc(
      collection(this.firestore, this.collection),
      {
        ...evaluation.serialize(),
        lastUpdateDate: new Date().toISOString()
      }
    );

    // Aggiorniamo la chiave dell'oggetto evaluation con l'ID generato
    evaluation.setKey(docRef.id);
    this.updateLocalCache(evaluation);
    return docRef;
  }

  async updateEvaluation(evaluation: Evaluation) {
    if (!evaluation.key) {
      throw new Error('Impossibile aggiornare una valutazione senza chiave');
    }

    await setDoc(
      doc(this.firestore, this.collection, evaluation.key),
      {
        ...evaluation.serialize(),
        lastUpdateDate: new Date().toISOString()
      }
    );

    this.updateLocalCache(evaluation);
  }

  async deleteEvaluation(evaluation: Evaluation) {
    if (!evaluation.key) {
      throw new Error('Impossibile eliminare una valutazione senza chiave');
    }

    await deleteDoc(doc(this.firestore, this.collection, evaluation.key));
    this.invalidateCache(evaluation);
  }

  // Metodi di utilità
  fetchEvaluationsCount4Student(
    studentKey: string,
    teacherKey: string,
    callback: (evaluationscount: number) => void,
    subjectKey?: string
  ) {
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations) => {
      callback(evaluations.length);
    }, subjectKey);
  }

  fetchAverageGrade4StudentAndTeacher(
    studentKey: string,
    teacherKey: string,
    callback: (averageGrade: number) => void,
    subjectKey?: string
  ) {
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations) => {
      const total = evaluations.reduce((sum, Myeval) => sum + (Myeval.gradeInDecimal || 0), 0);
      callback(evaluations.length > 0 ? total / evaluations.length : 0);
    }, subjectKey);
  }

  fetchAverageGradeWhitCount4StudentAndTeacher(
    studentKey: string,
    teacherKey: string,
    callback: (result: EvaluationCount) => void,
    subjectKey?: string
  ) {
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations) => {
      const total = evaluations.reduce((sum, myEval) => sum + (myEval.gradeInDecimal || 0), 0);
      const count = evaluations.length;
      callback({
        averageGrade: count > 0 ? total / count : 0,
        evaluationscount: count
      });
    }, subjectKey);
  }

  // Metodo per forzare il refresh dei dati
  async refreshEvaluations(
    studentKey: string,
    teacherKey: string,
    callback: (evaluations: Evaluation[]) => void,
    subjectKey?: string
  ) {
    const evaluations = await this.fetchEvaluationsFromServer(
      studentKey,
      teacherKey,
      subjectKey
    );

    this.updateCache(studentKey, teacherKey, evaluations, subjectKey);
    callback(evaluations);
  }

  // Svuota la cache (utile per il logout)
  clearCache(): void {
    this.evaluationCache.clear();
    this.loadingPromises.clear();
  }

  // Metodi legacy per retrocompatibilità
  getEvaluationsOnRealtime(callback: (evaluations: Evaluation[]) => void, queries?: QueryCondition[]) {
    const collectionRef = collection(this.firestore, this.collection);
    const q = !queries ? collectionRef : query(
      collectionRef,
      ...queries.map(q => where(q.field, q.operator, q.value))
    );

    return onSnapshot(q, (snapshot) => {
      const evaluations = snapshot.docs.map(doc =>
        new Evaluation(doc.data()).setKey(doc.id)
      );
      callback(evaluations);
    });
  }

  getEvaluationsForStudent(studentKey: string, callback: (evaluations: Evaluation[]) => void) {
    // Utilizza la nuova implementazione con cache
    // Nota: richiede il teacherKey che non abbiamo qui
    // Per retrocompatibilità, usiamo il metodo vecchio
    this.getEvaluationsOnRealtime(callback, [
      new QueryCondition('studentKey', '==', studentKey)
    ]);
  }

  getEvaluationsForClass(classKey: string, callback: (evaluations: Evaluation[]) => void) {
    // Metodo legacy - non supporta la cache
    this.getEvaluationsOnRealtime(callback, [
      new QueryCondition('classKey', '==', classKey)
    ]);
    const collectionRef = collection(this.firestore, this.collection);
    const q = query(collectionRef, where('classeKey', '==', classKey));
    return onSnapshot(q, (snapshot) => {
      const evaluations: Evaluation[] = [];
      snapshot.forEach((doc) => {
        evaluations.push(new Evaluation(doc.data()).setKey(doc.id));
      });
      callback(evaluations);
    });
  }
}
