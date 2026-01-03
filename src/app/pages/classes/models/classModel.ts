import { DocumentModel } from "./documentModel";

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
  verbali: DocumentModel[];
}

export class ClasseModel implements IClasseModel {
  id?: string;
  year: string = "";
  classe: string = "";
  descrizione: string = "";
  note: string = "";
  archived: boolean = false;
  verbali: DocumentModel[] = [];
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
    verbali: this.verbali.map((verbale) => verbale.serialize()),
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