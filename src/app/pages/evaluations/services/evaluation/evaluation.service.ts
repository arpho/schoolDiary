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
  fetchEvaluationsCount4Student(studentKey: string, teacherKey: string, callback: (evaluationscount: number) => void) {
    console.log("#fetchEvaluationsCount4Student studentKey", studentKey,);
    console.log("#fetchEvaluationsCount4Student teacherKey", teacherKey);
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations: Evaluation[]) => {
      callback(evaluations.length);
    });
    
  }
  fetchAverageGrade4StudentAndTeacher(studentKey: string, teacherKey: string, callback: (averageGrade: number) => void) {
    console.log("#fetchAverageGrade4StudentAndTeacher studentKey", studentKey);
    console.log("#fetchAverageGrade4StudentAndTeacher teacherKey", teacherKey);
    this.getEvaluation4studentAndTeacher(studentKey, teacherKey, (evaluations: Evaluation[]) => {
      callback(evaluations.reduce((total, evaluation) => total + evaluation.gradeInDecimal, 0) / evaluations.length);
    });

  }
  private firestore = inject(Firestore);
  collection = 'valutazioni';

  async fetchEvaluation(evaluationKey: string) {
    const docRef = doc(this.firestore, this.collection, evaluationKey);
    const rawEvaluation = await getDoc(docRef);
    return new Evaluation(rawEvaluation.data()).setKey(rawEvaluation.id);
  }

  addEvaluation(evaluation: Evaluation) {
    const collectionRef = collection(this.firestore, this.collection);
    const now = new Date().toISOString();
    evaluation.lastUpdateDate = now;
    return addDoc(collectionRef, evaluation.serialize());
  }
 editEvaluation(evaluation: Evaluation) {
    return this.updateEvaluation(evaluation);
  }
  updateEvaluation( evaluation: Evaluation) {
    const docRef = doc(this.firestore, this.collection, evaluation.key);
    const now = new Date().toISOString();
    evaluation.lastUpdateDate = now;
    console.log("evaluation to be updated",evaluation.serialize())
    return setDoc(docRef, evaluation.serialize());
  }
  async getEvaluation(evaluationKey: string) {
    const docRef = doc(this.firestore, this.collection, evaluationKey);
     const evaluation = new Evaluation((await getDoc(docRef)).data()).setKey(docRef.id);
     return evaluation;
  }

getEvaluation4studentAndTeacher(studentKey: string, teacherKey: string, callback: (evaluations: Evaluation[]) => void) {
this.getEvaluationsOnRealtime(callback, [new QueryCondition('studentKey', '==', studentKey), new QueryCondition('teacherKey', '==', teacherKey)]);
}

  getEvaluationsOnRealtime(callback: (evaluations: Evaluation[]) => void, queries?: QueryCondition[]) {
    
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
