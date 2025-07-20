import { Grids } from './grids';

export class Evaluation {
  key: string = '';
  description: string = '';
  note: string = '';
  data: string = '';
  grid: Grids = new Grids();
  classeKey: string = '';
  studentKey: string = '';

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
        this.grid = args.grid || new Grids();
      }
      Object.assign(this, { 
        ...args, 
        grid: this.grid 
      });
    }
    return this;
  }

  serialize() {
    return {
      description: this.description,
      note: this.note,
      data: this.data,
      grid: this.grid.key,
      classeKey: this.classeKey,
      studentKey: this.studentKey
    };
  }
}
