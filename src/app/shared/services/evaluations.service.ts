import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Evaluation } from '../../pages/evaluations/models/evaluation';

@Injectable({
  providedIn: 'root'
})
export class EvaluationsService {
  private _evaluations = new BehaviorSubject<Evaluation[]>([]);
  public evaluations$ = this._evaluations.asObservable();
  
  constructor() {}

  loadStudentEvaluations(studentKey: string) {
    console.log('Caricamento valutazioni per studente:', studentKey);
    
    // Simulazione di caricamento con dati mock
    setTimeout(() => {
      const mockEvaluations: Evaluation[] = [
        { voto: 8, votoMax: 10 } as any,
        { voto: 7, votoMax: 10 } as any
      ];
      this._evaluations.next(mockEvaluations);
    }, 500);
  }

  async getEvaluationsByStudent(studentKey: string): Promise<Evaluation[]> {
    // TODO: Implementare la logica per recuperare le valutazioni dello studente
    // Per ora restituiamo un array vuoto
    console.log("Recupero valutazioni per lo studente:", studentKey);
    return [];
  }
}
