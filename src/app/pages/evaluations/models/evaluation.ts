import { Grids } from '../../../shared/models/grids';

/**
 * Modello che rappresenta una valutazione (voto, griglia, note) assegnata ad uno studente.
 */
export class Evaluation {
  key: string = '';
  description: string = '';
  note: string = '';
  data: string = '';
  subjectKey: string = '';
  lastUpdateDate: string = '';
  grid: Grids = new Grids();
  gridsKey: string = '';
  classKey: string = '';
  studentKey: string = '';
  teacherKey: string = '';
  activityKey: string = '';

  constructor(args?: any) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: any) {
    if (args) {
      if (args.grid && typeof args.grid === 'string') {
        this.grid = new Grids({ key: args.grid });
      } else {
        this.grid = new Grids(args.grid);
      }
      Object.assign(this, {
        ...args,
        grid: this.grid
      });
      this.gridsKey = this.grid.key;
    }
    return this;
  }

  /** ritorna il voto totale calcolato dalla griglia */
  get voto() {
    return this.grid.voto;
  }

  /** ritorna il voto massimo possibile calcolato dalla griglia */
  get votoMax() {
    return this.grid.votoMax;
  }

  /** calcola il voto in decimi */
  get gradeInDecimal() {
    return this.voto / this.votoMax * 10;
  }

  serialize() {
    return {
      description: this.description,
      note: this.note,
      subjectKey: this.subjectKey,
      data: this.data,
      lastUpdateDate: this.lastUpdateDate,
      grid: this.grid.serialize(),
      classKey: this.classKey,
      studentKey: this.studentKey,
      teacherKey: this.teacherKey,
      activityKey: this.activityKey,
      fullText: `${this.description} ${this.note}`  // per la ricerca fulltext
    };
  }
}
