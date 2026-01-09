// Modello Grids, ispirato agli altri modelli
import { Indicatore } from './indicatore';

/**
 * Modello che rappresenta una griglia di valutazione composta da indicatori.
 */
export class Grids {
  /** Identificativo della griglia */
  key: string = '';
  /** Nome della griglia */
  nome: string = '';
  /** Descrizione della griglia */
  descrizione: string = '';
  /** Lista di indicatori di valutazione */
  indicatori: Indicatore[] = [];
  /** Chiave del proprietario (docente) */
  ownerKey: string = '';

  /**
   * Calcola il voto massimo ottenibile sommando i valori massimi degli indicatori.
   */
  get votoMax(): any {
    return this.indicatori.reduce((acc, indicator) => acc + Number(indicator.valore), 0);
  }

  /**
   * Calcola il voto totale ottenuto sommando i voti assegnati ai singoli indicatori.
   */
  get voto(): any {
    return this.indicatori.reduce((acc, indicator) => acc + Number(indicator.voto), 0);
  }

  /**
   * Costruttore della griglia.
   * @param args Proprietà iniziali.
   */
  constructor(args?: any) {
    this.build(args);
  }

  /**
   * Imposta la chiave della griglia.
   * @param key Chiave univoca.
   * @returns L'istanza corrente.
   */
  setKey(key: string) {
    this.key = key;
    return this;
  }

  /**
   * Costruisce l'oggetto popolando le proprietà e istanziando gli indicatori.
   * @param args Proprietà da assegnare.
   * @returns L'istanza corrente.
   */
  build(args?: any) {
    if (args) {
      if (Array.isArray(args.indicatori)) {
        this.indicatori = args.indicatori.map((c: any) => new Indicatore(c));
      }
      Object.assign(this, { ...args, indicatori: this.indicatori });
      if (typeof args.descrizione === 'string') {
        this.descrizione = args.descrizione;
      }
    }
    return this;
  }

  /**
   * Serializza l'oggetto per il salvataggio.
   * @returns Oggetto JSON.
   */
  serialize() {
    return {
      key: this.key,
      nome: this.nome,
      descrizione: this.descrizione,
      indicatori: this.indicatori.map(c => c.serialize()),
      ownerKey: this.ownerKey
    };
  }
}
