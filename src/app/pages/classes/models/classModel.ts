export interface IClasseModel {
  id?: string;
  year: string;
  classe: string;
  descrizione: string;
  note: string;
  archived: boolean;
  coordinatore: string;
  segretario: string;
  key: string;
}

export class ClasseModel implements IClasseModel {
  id?: string;
  year: string = "";
  classe: string = "";
  descrizione: string = "";
  note: string = "";
  archived: boolean = false;
  coordinatore: string = "";
  segretario: string = "";
  key: string = "";
  constructor(args?: Partial<IClasseModel>) {
    this.build(args);
  }

  build(args?: Partial<IClasseModel>): this {
    if (args) {
      Object.assign(this, args);
    }


  return this
}
serialize() {
  return {
    year: this.year,
    classe: this.classe,
    description: this.descrizione,
    note: this.note,
    archived: this.archived,
    coordinatore: this.coordinatore,
    segretario: this.segretario,
    key: this.key
  }
    }

    setKey(key: string){
      this.key = key
      return this
    }
}