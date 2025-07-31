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
  getDoc,
  onSnapshot
} from '@angular/fire/firestore';
import { Evaluation } from '../../models/evaluation';
import { QueryCondition } from 'src/app/shared/models/queryCondition';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private firestore = inject(Firestore);
  collection = 'valutazioni';

  async fetchEvaluation(evaluationKey: string) {
    const docRef = doc(this.firestore, this.collection, evaluationKey);
    const rawEvaluation = await getDoc(docRef);
    return new Evaluation(rawEvaluation.data()).setKey(rawEvaluation.id);
  }

  addEvaluation(evaluation: Evaluation) {
    const collectionRef = collection(this.firestore, this.collection);
    return addDoc(collectionRef, evaluation.serialize());
  }

  updateEvaluation(evaluationKey: string, evaluation: Evaluation) {
    const docRef = doc(this.firestore, this.collection, evaluationKey);
    return setDoc(docRef, evaluation.serialize());
  }

  getEvaluationsOnRealtime(callback: (evaluations: Evaluation[]) => void, queries?: QueryCondition[]) {
    console.log("getEvaluationsOnRealtime")
    
    const collectionRef = collection(this.firestore, this.collection,);
    const q = !queries ? collectionRef : query(collectionRef, ...queries.map((queryCondition: QueryCondition) => where(queryCondition.field, queryCondition.operator, queryCondition.value)));
<<<<<<< HEAD

=======
    console.log("queries*", queries )
    console.log("q*", q)
>>>>>>> origin/main
    return onSnapshot(q, (snapshot) => {
      const evaluations: Evaluation[] = [];
      snapshot.forEach((doc) => {
        evaluations.push(new Evaluation(doc.data()).setKey(doc.id));
      } );
      callback(evaluations);
    });
  }

  getEvaluationsForStudent(studentKey: string, callback: (evaluations: Evaluation[]) => void) {
    const collectionRef = collection(this.firestore, this.collection);
    const q = query(collectionRef, where('studentKey', '==', studentKey));
    return onSnapshot(q, (snapshot) => {
      const evaluations: Evaluation[] = [];
      snapshot.forEach((doc) => {
        evaluations.push(new Evaluation(doc.data()).setKey(doc.id));
      });
      callback(evaluations);
    });
  }

  getEvaluationsForClass(classKey: string, callback: (evaluations: Evaluation[]) => void) {
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
