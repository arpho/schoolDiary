import { UserModel } from 'src/app/shared/models/userModel';

/**
 * Modello che rappresenta uno studente (Alunno).
 * Estende UserModel aggiungendo dettagli specifici per il contesto scolastico.
 */
export class Alunno extends UserModel {
  /** Nome completo dello studente */
  fullName: string = '';

  constructor(args?: Partial<Alunno>) {
    super(args);
    if (args) {
      this.fullName = args.fullName || '';
    }
  }

  /**
   * Imposta il nome completo.
   * @param fullName Nome completo.
   * @returns Istanza corrente.
   */
  setFullName(fullName: string): this {
    this.fullName = fullName;
    return this;
  }
}

export interface IAlunno extends Partial<Alunno> { }
