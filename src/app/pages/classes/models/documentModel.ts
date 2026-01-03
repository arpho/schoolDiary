export class DocumentModel{
  name: string="";
  path: string="";
  descrizione: string="";

  constructor(args?: Partial<DocumentModel>) {
    this.build(args);
  }

  build(args?: Partial<DocumentModel>): this {
    if (args) {
      Object.assign(this, args);
    }


  return this
}

serialize() {
  return {
    name: this.name,
    path: this.path,
            descrizione: this.descrizione
        }
}
}