/**
 * Modello per le note riservate su una classe.
 * Visibili solo al proprietario (docente).
 */
export class ReservedNotes4class {
  ownerKey = "";
  note = "";
  classKey = "";
  key = "";
  date = "";

  constructor(args?: any) {
    this.build(args);
  }

  /** Imposta la chiave della classe */
  setClassKey(key: string) {
    this.classKey = key
    return this
  }

  /** Imposta la chiave della nota */
  setKey(key: string) {
    this.key = key
    return this
  }

  /** Imposta il contenuto della nota */
  setNote(note: string) {
    this.note = note
    return this
  }

  /** Imposta il proprietario della nota */
  setOwner(owner: string) {
    this.ownerKey = owner
    return this
  }

  /** Imposta la data */
  setDate(date: string) {
    this.date = date
    return this
  }

  /** Costruisce l'oggetto */
  build(args: any) {
    Object.assign(this, args)
    return this
  }

  /** Serializza per il salvataggio */
  serialize() {
    return {
      key: this.key,
      note: this.note,
      ownerKey: this.ownerKey,
      classKey: this.classKey,
      date: this.date
    }
  }
}