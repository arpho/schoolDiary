// Modello Descrittore, ispirato a UserModel

/**
 * Modello che rappresenta un descrittore di valutazione.
 */
export class Descrittore {
  /** Chiave univoca del descrittore */
  key: string = '';
  /** Descrizione testuale */
  descrizione: string = '';
  /** Valore numerico associato */
  value: number = 0;

  /**
   * Costruttore del descrittore.
   * @param args Proprietà iniziali.
   */
  constructor(args?: Partial<Descrittore>) {
    this.build(args);
  }

  /**
   * Imposta la chiave del descrittore.
   * @param key Chiave univoca.
   * @returns L'istanza corrente.
   */
  setKey(key: string) {
    this.key = key;
    return this;
  }

  /**
   * Costruisce l'oggetto popolando le proprietà.
   * @param args Proprietà da assegnare.
   * @returns L'istanza corrente.
   */
  build(args?: Partial<Descrittore>) {
    Object.assign(this, args);
    return this;
  }

  /**
   * Serializza l'oggetto per il salvataggio.
   * @returns Oggetto JSON.
   */
  serialize() {
    return {
      key: this.key,
      descrizione: this.descrizione,
      value: this.value
    };
  }
}
