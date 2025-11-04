import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Evaluation } from '../../pages/evaluations/models/evaluation';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsService {
  fetchAverageGrade4StudentAndTeacher(arg0: string, arg1: (averageGrade: number) => void) {
    throw new Error('Method not implemented.');
  }
  fetchEvaluationsCount4Student(arg0: string, arg1: (evaluationscount: number) => void) {
    throw new Error('Method not implemented.');
  }
  fetchAverageGrade4Student(arg0: string, arg1: (averageGrade: number) => void) {
 
  }
  private _evaluations = new BehaviorSubject<Evaluation[]>([]);
  public evaluations$ = this._evaluations.asObservable();
  
  constructor() {}

  loadStudentEvaluations(studentKey: string) {
    console.log('Caricamento valutazioni per studente:', studentKey);
    
    // Simulazione di caricamento con dati mock

  }

  async getEvaluationsByStudent(studentKey: string): Promise<Evaluation[]> {
    // TODO: Implementare la logica per recuperare le valutazioni dello studente
    // Per ora restituiamo un array vuoto
    console.log("Recupero valutazioni per lo studente:", studentKey);
    return [];
  }
}
