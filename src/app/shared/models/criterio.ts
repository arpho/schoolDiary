// Modello Criterio, ispirato a UserModel
import { Descrittore } from './descrittore';

/**
 * Modello che rappresenta un criterio di valutazione all'interno di un indicatore.
 */
export class Criterio {
  /** Chiave univoca del criterio */
  key: string = '';
  /** Descrizione del criterio */
  descrizione: string = '';
  /** Valore del range di valutazione (es. 0-10) */
  rangeValue: string = '';

  /**
   * Costruttore del criterio.
   * @param args Proprietà iniziali.
   */
  constructor(args?: any) {
    this.build(args);
  }

  /**
   * Costruisce l'oggetto popolando le proprietà.
   * @param args Proprietà da assegnare.
   * @returns L'istanza corrente.
   */
  build(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
    return this;
  }

  /** Getter per il range di valori */
  get valori() {
    return this.rangeValue;
  }
  /** Setter per il range di valori */
  set valori(valori: string) {
    this.rangeValue = valori;
  }

  /**
   * Serializza l'oggetto per il salvataggio.
   * @returns Oggetto JSON.
   */
  serialize() {
    return {
      key: this.key,
      descrizione: this.descrizione,
      rangeValue: this.rangeValue
    };
  }
}
