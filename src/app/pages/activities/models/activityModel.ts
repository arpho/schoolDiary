/**
 * Modello che rappresenta un'attività (compito, verifica, etc.).
 */
export class ActivityModel {
  /** Chiave univoca dell'attività */
  key: string = '';
  /** Titolo dell'attività */
  title: string = '';
  /** Data dell'attività */
  date: string = '';
  /** Chiave della classe associata */
  classKey: string = '';
  /** Descrizione dettagliata */
  description: string = '';
  /** Chiave del docente che ha creato l'attività */
  teacherKey: string = '';
  /** Data di scadenza (opzionale) */
  dueDate: string = '';
  /** Chiave della materia associata */
  subjectsKey: string = '';

  constructor(args?: any) {
    this.build(args);
  }

  /**
   * Imposta la chiave dell'attività.
   * @param key Chiave univoca.
   * @returns L'istanza corrente (fluent interface).
   */
  setKey(key: string) {
    this.key = key;
    return this;
  }

  /**
   * Imposta la chiave del docente.
   * @param teacherKey Chiave del docente.
   * @returns L'istanza corrente (fluent interface).
   */
  setTeacherKey(teacherKey: string) {
    this.teacherKey = teacherKey;
    return this;
  }
  build(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
    return this;
  }

  /**
   * Serializza l'oggetto per il salvataggio su Firestore.
   * @returns Oggetto JSON.
   */
  serialize() {
    return {
      key: this.key,
      title: this.title,
      date: this.date,
      classKey: this.classKey,
      description: this.description,
      teacherKey: this.teacherKey,
      dueDate: this.dueDate,
      subjectsKey: this.subjectsKey
    };
  }
}