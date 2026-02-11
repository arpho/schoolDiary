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
import { ToastController } from '@ionic/angular/standalone';

export interface EvaluationCount {
  averageGrade: number;
  evaluationscount: number;
}

/**
 * Servizio per la gestione delle valutazioni.
 * Implementa una cache locale avanzata e sottoscrizioni realtime.
 */
@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private evaluationCache = new Map<string, Evaluation[]>();
  private loadingPromises = new Map<string, Promise<Evaluation[]>>();
  private firestore = inject(Firestore);
  private toastController = inject(ToastController);
  private collectionName = 'valutazioni';

  // Store Firebase API functions to avoid injection context warnings
  private collectionFn = collection;
  private queryFn = query;
  private whereFn = where;
  private getDocsFn = getDocs;
  private addDocFn = addDoc;
  private onSnapshotFn = onSnapshot;
  private deleteDocFn = deleteDoc;
  private getDocFn = getDoc;
  private setDocFn = setDoc;
  private docFn = doc;

  private getCacheKey(studentKey: string, teacherKey: string, subjectKey?: string): string {
    const baseKey = `${studentKey}_${teacherKey}`;
    return subjectKey ? `${baseKey}_${subjectKey}` : baseKey;
  }

  /**
   * Recupera le valutazioni dal server.
   * @param studentKey Chiave dello studente.
   * @param teacherKey Chiave del docente.
   * @param subjectKey Chiave della materia (opzionale).
   * @returns Promise con la lista delle valutazioni.
   */
  private async fetchEvaluationsFromServer(
    studentKey: string,
    teacherKey: string,
    subjectKey?: string
  ): Promise<Evaluation[]> {
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const conditions = [
      this.whereFn('studentKey', '==', studentKey),
      this.whereFn('teacherKey', '==', teacherKey)
    ];

    if (subjectKey) {
      conditions.push(this.whereFn('subjectKey', '==', subjectKey));
    }

    const q = this.queryFn(collectionRef, ...conditions);
    const querySnapshot = await this.getDocsFn(q);

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

  /**
   * Ottiene le valutazioni di uno studente per un docente specifico.
   * Gestisce cache, caricamento e aggiornamenti realtime.
   * @param studentKey Chiave dello studente.
   * @param teacherKey Chiave del docente.
   * @param callback Callback chiamata con i dati aggiornati.
   * @param subjectKey Chiave della materia (opzionale).
   * @returns Unsubscribe function.
   */
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
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const conditions = [
      this.whereFn('studentKey', '==', studentKey),
      this.whereFn('teacherKey', '==', teacherKey)
    ];

    if (subjectKey) {
      conditions.push(this.whereFn('subjectKey', '==', subjectKey));
    }

    const q = this.queryFn(collectionRef, ...conditions);

    return this.onSnapshotFn(q, (snapshot) => {
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
  /**
   * Recupera una singola valutazione.
   * @param evaluationKey Chiave della valutazione.
   * @returns Promise con il modello della valutazione.
   */
  async fetchEvaluation(evaluationKey: string): Promise<Evaluation> {
    const docRef = this.docFn(this.firestore, this.collectionName, evaluationKey);
    const docSnap = await this.getDocFn(docRef);
    if (!docSnap.exists()) {
      throw new Error('Valutazione non trovata');
    }
    return new Evaluation(docSnap.data()).setKey(docSnap.id);
  }

  /**
   * Aggiunge una nuova valutazione.
   * @param evaluation Modello della valutazione.
   * @returns Promise con il riferimento al documento creato.
   */
  async addEvaluation(evaluation: Evaluation) {
    const docRef = await this.addDocFn(
      this.collectionFn(this.firestore, this.collectionName),
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

  /**
   * Aggiorna una valutazione esistente.
   * @param evaluation Modello con i dati aggiornati.
   * @returns Promise vuota.
   */
  async updateEvaluation(evaluation: Evaluation) {
    if (!evaluation.key) {
      throw new Error('Impossibile aggiornare una valutazione senza chiave');
    }

    await this.setDocFn(
      this.docFn(this.firestore, this.collectionName, evaluation.key),
      {
        ...evaluation.serialize(),
        lastUpdateDate: new Date().toISOString()
      }
    );

    this.updateLocalCache(evaluation);
  }

  /**
   * Elimina una valutazione.
   * @param evaluation Modello della valutazione da eliminare.
   * @returns Promise vuota.
   */
  async deleteEvaluation(evaluation: Evaluation) {
    if (!evaluation.key) {
      throw new Error('Impossibile eliminare una valutazione senza chiave');
    }

    await this.deleteDocFn(this.docFn(this.firestore, this.collectionName, evaluation.key));
    this.invalidateCache(evaluation);
  }

  // Metodi di utilità
  /**
   * Calcola il numero di valutazioni per uno studente.
   * @param studentKey Chiave dello studente.
   * @param teacherKey Chiave del docente.
   * @param callback Callback con il conteggio.
   * @param subjectKey Filtro materia opzionale.
   */
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

  /**
   * Calcola la media dei voti.
   * @param studentKey Chiave dello studente.
   * @param teacherKey Chiave del docente.
   * @param callback Callback con la media.
   * @param subjectKey Filtro materia.
   * @param startDate Filtro data inizio.
   */
  fetchAverageGrade4StudentAndTeacher(
    studentKey: string,
    teacherKey: string,
    callback: (averageGrade: number) => void,
    subjectKey?: string,
    startDate?: string
  ) {
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations) => {
      console.log(`[EvaluationService] Total evaluations for ${studentKey}: ${evaluations.length}`);
      let filteredEvaluations = evaluations;
      if (startDate) {
        const start = new Date(startDate).getTime();
        filteredEvaluations = evaluations.filter(e => {
          let evalDateVal: number;
          // Check if it's a Firestore Timestamp (has toDate method)
          if (e.data && typeof (e.data as any).toDate === 'function') {
            evalDateVal = (e.data as any).toDate().getTime();
          } else {
            // Assume string or Date object
            evalDateVal = new Date(e.data).getTime();
          }
          return evalDateVal >= start;
        });
      }
      const total = filteredEvaluations.reduce((sum, Myeval) => sum + (Myeval.gradeInDecimal || 0), 0);
      callback(filteredEvaluations.length > 0 ? total / filteredEvaluations.length : 0);
    }, subjectKey);
  }

  /**
   * Calcola media e numero valutazioni insieme.
   * @param studentKey Chiave dello studente.
   * @param teacherKey Chiave del docente.
   * @param callback Callback con il risultato (media e contatore).
   */
  fetchAverageGradeWhitCount4StudentAndTeacher(
    studentKey: string,
    teacherKey: string,
    callback: (result: EvaluationCount) => void,
    subjectKey?: string,
    startDate?: string
  ) {
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations) => {
      let filteredEvaluations = evaluations;
      if (startDate) {
        const start = new Date(startDate).getTime();
        filteredEvaluations = evaluations.filter(e => {
          let evalDateVal: number;
          if (e.data && typeof (e.data as any).toDate === 'function') {
            evalDateVal = (e.data as any).toDate().getTime();
          } else {
            evalDateVal = new Date(e.data).getTime();
          }
          return evalDateVal >= start;
        });
      }
      const total = filteredEvaluations.reduce((sum, myEval) => sum + (myEval.gradeInDecimal || 0), 0);
      const count = filteredEvaluations.length;
      callback({
        averageGrade: count > 0 ? total / count : 0,
        evaluationscount: count
      });
    }, subjectKey);
  }

  // Metodo per forzare il refresh dei dati
  /**
   * Forza il refresh delle valutazioni dal server.
   */
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
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const q = !queries ? collectionRef : this.queryFn(
      collectionRef,
      ...queries.map(q => this.whereFn(q.field, q.operator, q.value))
    );

    return this.onSnapshotFn(q, (snapshot) => {
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
    const collectionRef = this.collectionFn(this.firestore, this.collectionName);
    const q = this.queryFn(collectionRef, this.whereFn('classeKey', '==', classKey));
    return this.onSnapshotFn(q, (snapshot) => {
      const evaluations: Evaluation[] = [];
      snapshot.forEach((doc) => {
        evaluations.push(new Evaluation(doc.data()).setKey(doc.id));
      });
      callback(evaluations);
    });
  }

  /**
   * Genera il PDF per una valutazione utilizzando un Web Worker.
   * @param evaluationKey Chiave della valutazione.
   * @returns Promise con la stringa Base64 del PDF.
   */
  async generatePdf(evaluationKey: string): Promise<string> {
    try {
      // 1. Fetch Evaluation Data
      const evaluation = await this.fetchEvaluation(evaluationKey);
      
      // 2. Fetch Related Data (Student, Teacher, Class)
      let studentName = "Unknown Student";
      let className = "Unknown Class";
      let teacherName = "Unknown Teacher";

      if (evaluation.studentKey) {
        const studentDoc = await this.getDocFn(this.docFn(this.firestore, "userProfiles", evaluation.studentKey));
        if (studentDoc.exists()) {
          const s = studentDoc.data();
          studentName = `${s['lastName']} ${s['firstName']}`;
        }
      }

      if (evaluation.classKey) {
        const classDoc = await this.getDocFn(this.docFn(this.firestore, "classi", evaluation.classKey));
        if (classDoc.exists()) {
          const c = classDoc.data();
          className = c['classe'] || "";
        }
      }

      if (evaluation.teacherKey) {
        const teacherDoc = await this.getDocFn(this.docFn(this.firestore, "userProfiles", evaluation.teacherKey));
        if (teacherDoc.exists()) {
          const t = teacherDoc.data();
          teacherName = `${t['lastName']} ${t['firstName']}`;
        }
      }

      // 3. Generate PDF via Web Worker
      return new Promise((resolve, reject) => {
        if (typeof Worker !== 'undefined') {
          // Calculate relative path to worker. 
          // Service is in src/app/pages/evaluations/services/evaluation/
          // Worker is in src/app/
          const worker = new Worker(new URL('../../../../pdf-generator.worker', import.meta.url));
          
          let evalDate: string | Date = "";
          if (evaluation.data) {
             // Handle Firestore Timestamp or Date or string
             if (typeof (evaluation.data as any).toDate === "function") {
               evalDate = (evaluation.data as any).toDate();
             } else {
               evalDate = evaluation.data;
             }
          }

          const workerData = {
            description: evaluation.description,
            date: evalDate,
            grid: evaluation.grid,
            studentName,
            className,
            teacherName
          };

          // Timeout after 60 seconds
          const timeoutPromise = new Promise<string>((_, reject) => {
             setTimeout(() => reject(new Error('PDF generation timed out')), 60000); 
          });

          console.log("PDF Generator: Starting race between worker and timeout...");
          
          Promise.race([
            new Promise<string>((resolve, reject) => {
               worker.onmessage = ({ data }) => {
                if (data.error) {
                  reject(data.error);
                } else if (data.base64) {
                  resolve(data.base64);
                } else if (data.blob) {
                  const reader = new FileReader();
                  reader.readAsDataURL(data.blob);
                  reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // Ensure we strip the prefix if it exists
                    const base64Content = base64data.includes(',') ? base64data.split(',')[1] : base64data;
                    resolve(base64Content);
                  };
                  reader.onerror = (e) => reject(e);
                }
                worker.terminate();
              };
              
              worker.onerror = (err) => {
                  console.error('Worker Error:', err);
                  reject(new Error(`Worker error: ${err.message}`));
                  worker.terminate();
              };

              worker.onmessageerror = (err) => {
                  console.error('Worker Message Error:', err);
                  reject(new Error('Worker message error'));
                  worker.terminate();
              };

              console.log("Posting message to worker...");
              worker.postMessage(workerData);
            }),
            timeoutPromise
          ]).then((result) => resolve(result)).catch((err) => {
             console.error("PDF Generation failed:", err);
             worker.terminate();
             reject(err as string);
          });

        } else {
          // Fallback if workers are not supported
          reject(new Error("Web Workers not supported"));
        }
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      const toast = await this.toastController.create({
        message: 'Errore durante la generazione del PDF',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      throw error;
    }
  }
}
