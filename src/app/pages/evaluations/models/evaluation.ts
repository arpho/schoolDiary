import { Grids } from '../../../shared/models/grids';

export class Evaluation {
  key: string = '';
  description: string = '';
  note: string = '';
  data: string = '';
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
        this.grid =new Grids(args.grid);
      }
      Object.assign(this, {
        ...args,
        grid: this.grid
      });
      this.gridsKey = this.grid.key;
      }
    return this;
  }
  get voto() {
    return this.grid.voto;
  }
  get votoMax() {
    return this.grid.votoMax;
  }

  serialize() {
    return {
      description: this.description,
      note: this.note,
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
