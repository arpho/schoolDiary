import { ClasseModel } from "src/app/pages/classes/models/classModel";
import { UsersRole } from "./usersRole";
import { AssignedClass } from "src/app/pages/subjects-list/models/assignedClass";
import { DocumentModel } from "src/app/pages/classes/models/documentModel";


export class UserModel {
  /**
   * Imposta la chiave univoca dell'utente (UID).
   * @param uid L'UID dell'utente (es. da Firebase Auth).
   * @returns L'istanza corrente per il chaining.
   */
  setKey(uid: string) {
    this.key = uid;
    return this;
  }
  /** Identificativo univoco dell'utente */
  key = '';
  /** Data di nascita */
  birthDate: string | number = '';
  /** Indirizzo email */
  email = '';
  /** Nome dell'utente */
  firstName = '';

  // Flag per Bisogni Educativi Speciali
  /** Disturbi Specifici dell'Apprendimento */
  DSA = false;
  /** Diversamente Abile */
  DVA = false;
  /** Bisogni Educativi Speciali */
  BES = false;
  /** Disturbo da Deficit di Attenzione/Iperattività */
  ADHD = false;

  /** Note aggiuntive sulle disabilità o bisogni */
  noteDisabilita = '';
  /** URL ai documenti del Piano Didattico Personalizzato */
  pdpUrl: DocumentModel[] = [];

  /** Cognome dell'utente */
  lastName = '';
  /** Password (generalmente non salvata in chiaro nel modello client, usata in fase di creazione/auth) */
  password = '';
  /** Chiave della classe principale di appartenenza (se studente) */
  classKey: string = '';
  /** Numero di telefono */
  phoneNumber = '';
  /** Ruolo dell'utente (Studente, Docente, Admin, ecc.) */
  role: UsersRole = UsersRole.STUDENT;
  /** Username o nome visualizzato */
  userName = '';

  /** Classi assegnate (popolato per i docenti) */
  assignedClasses: AssignedClass[] = [];

  /** Elenco delle chiavi delle classi associate */
  classesKey: string[] = [];

  /**
   * Setter per le chiavi delle classi.
   * @param classes Array di chiavi delle classi.
   */
  set classes(classes: string[]) {
    this.classesKey = classes;
  }

  /**
   * Getter per le chiavi delle classi.
   * @returns Array di chiavi delle classi.
   */
  get classes() {
    return this.classesKey;
  }
  /**
   * Costruttore della classe UserModel.
   * @param args Oggetto opzionale con le proprietà da inizializzare.
   */
  constructor(args?: {}) {
    this.build(args);
  }
  /**
   * Setter per la classe principale.
   * @param classe Chiave della classe.
   */
  set classe(classe: string) {
    this.classKey = classe;
  }

  /**
   * Imposta la chiave della classe in stile builder.
   * @param classKey Chiave della classe.
   * @returns L'istanza corrente.
   */
  setClassKey(classKey: string) {
    this.classKey = classKey;
    return this;
  }

  /**
   * Getter per la chiave della classe.
   * @returns Chiave della classe.
   */
  get classe() {
    return this.classKey;
  }
  build(args?: {}) {
    Object.assign(this, args)



    return this

  }
  /**
   * Serializza l'oggetto in un formato adatto per il salvataggio (es. su Firebase).
   * @returns Oggetto JSON serializzato.
   */
  serialize() {
    return {
      key: this.key,
      birthDate: this.birthDate,
      classKey: this.classKey,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      role: this.role,
      DVA: this.DVA,
      DSA: this.DSA,
      BES: this.BES,
      ADHD: this.ADHD,
      assignedClasses: this.assignedClasses.map((classe) => classe.serialize()),
      noteDisabilita: this.noteDisabilita,
      pdpUrl: this.pdpUrl,
      userName: this.userName,
      classes: this.classesKey
    };
  }
}
