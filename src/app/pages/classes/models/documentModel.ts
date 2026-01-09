/**
 * Modello che rappresenta un documento (es. verbale).
 */
export class DocumentModel {
  /** Nome del documento */
  name: string = "";
  /** Percorso o URL del documento */
  path: string = "";
  /** Descrizione del documento */
  descrizione: string = "";

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