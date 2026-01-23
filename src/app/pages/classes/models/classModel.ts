import { DocumentModel } from "./documentModel";

/**
 * Interfaccia che definisce la struttura di una Classe.
 */
export interface IClasseModel {
  id?: string;
  year: string;
  classe: string;
  descrizione: string;
  note: string;
  archived: boolean;
  coordinatore: string;
  segretario: string;
  key: string;
  verbali: DocumentModel[];
}

/**
 * Classe che implementa il modello di una Classe scolastica.
 */
export class ClasseModel implements IClasseModel {
  id?: string;
  /** Anno scolastico o anno di corso */
  year: string = "";
  /** Sezione della classe (es. A, B) */
  classe: string = "";
  /** Descrizione aggiuntiva */
  descrizione: string = "";
  /** Note relative alla classe */
  note: string = "";
  /** Indica se la classe è archiviata */
  archived: boolean = false;
  /** Lista dei verbali associati */
  verbali: DocumentModel[] = [];
  /** Chiave del coordinatore */
  coordinatore: string = "";
  /** Chiave del segretario */
  segretario: string = "";
  /** Chiave univoca della classe */
  key: string = "";

  constructor(args?: Partial<IClasseModel>) {
    this.build(args);
  }

  /**
   * Costruisce l'oggetto a partire da dati parziali.
   * @param args Dati parziali.
   * @returns Istanza corrente.
   */
  build(args?: Partial<IClasseModel> & { description?: string }): this {
    if (args) {
      Object.assign(this, args);
      // Handle legacy field mapping
      if (args.description && !this.descrizione) {
        this.descrizione = args.description;
      }
    }
    return this
  }

  /**
   * Serializza l'oggetto per il salvataggio.
   * @returns Oggetto JSON.
   */
  serialize() {
    return {
      year: this.year,
      classe: this.classe,
      descrizione: this.descrizione,
      note: this.note,
      verbali: this.verbali.map((verbale) => verbale.serialize()),
      archived: this.archived,
      coordinatore: this.coordinatore,
      segretario: this.segretario,
      key: this.key
    }
  }

  /**
   * Imposta la chiave della classe.
   * @param key Chiave univoca.
   * @returns Istanza corrente.
   */
  setKey(key: string) {
    this.key = key
    return this
  }
}