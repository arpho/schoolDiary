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
import { orderBy } from 'firebase/firestore';

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
 editEvaluation(evaluation: Evaluation) {
    return this.updateEvaluation(evaluation.key, evaluation);
  }
  updateEvaluation(evaluationKey: string, evaluation: Evaluation) {
    const docRef = doc(this.firestore, this.collection, evaluationKey);
    return setDoc(docRef, evaluation.serialize());
  }

getEvaluation4studentAndTeacher(studentKey: string, teacherKey: string, callback: (evaluations: Evaluation[]) => void) {
  console.log("getEvaluation4studentAndTeacher")
  console.log("studentKey", studentKey)
  console.log("teacherKey", teacherKey)
  const collectionRef = collection(this.firestore, this.collection);
  const q = query(collectionRef, where('studentKey', '==', studentKey),
         where('teacherKey', '==', teacherKey),
        orderBy('data','desc'));
  return onSnapshot(q, (snapshot) => {
    const evaluations: Evaluation[] = [];
    snapshot.forEach((doc) => {
      evaluations.push(new Evaluation(doc.data()).setKey(doc.id));
    });
    callback(evaluations);
  });
}

  getEvaluationsOnRealtime(callback: (evaluations: Evaluation[]) => void, queries?: QueryCondition[]) {
    console.log("getEvaluationsOnRealtime")
    
    const collectionRef = collection(this.firestore, this.collection,);
    const q = !queries ? collectionRef : query(collectionRef, ...queries.map((queryCondition: QueryCondition) => where(queryCondition.field, queryCondition.operator, queryCondition.value)));

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
