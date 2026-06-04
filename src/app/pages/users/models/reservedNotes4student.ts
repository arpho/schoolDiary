/** Categorie predefinite per le note */
export type NoteCategory =
  'comportamento' | 'profitto' | 'famiglia' | 'salute' | 'altro';

export const NOTE_CATEGORIES: { value: NoteCategory; label: string; color: string }[] = [
  { value: 'comportamento', label: 'Comportamento', color: '#e53935' },
  { value: 'profitto',      label: 'Profitto',      color: '#1976D2' },
  { value: 'famiglia',      label: 'Comunicazione Famiglia', color: '#388E3C' },
  { value: 'salute',        label: 'Salute',         color: '#f57c00' },
  { value: 'altro',         label: 'Altro',           color: '#757575' },
];

/**
 * Modello per le note riservate associate ad uno studente.
 */
export class ReservedNotes4student {
  ownerKey = '';
  note = '';
  studentKey = '';
  key = '';
  date = '';
  /** Categoria predefinita (default: 'altro') */
  category: NoteCategory = 'altro';
  /** URL allegato opzionale */
  attachmentUrl: string = '';

  constructor(args?: any) {
    this.build(args);
  }

  setStudentKey(key: string) {
    this.studentKey = key;
    return this;
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  setNote(note: string) {
    this.note = note;
    return this;
  }

  setOwner(owner: string) {
    this.ownerKey = owner;
    return this;
  }

  setDate(date: string) {
    this.date = date;
    return this;
  }

  build(args: any) {
    Object.assign(this, args);
    return this;
  }

  serialize() {
    return {
      key: this.key,
      note: this.note,
      ownerKey: this.ownerKey,
      studentKey: this.studentKey,
      date: this.date,
      category: this.category || 'altro',
      attachmentUrl: this.attachmentUrl || ''
    };
  }
}
