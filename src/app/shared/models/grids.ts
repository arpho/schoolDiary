// Modello Grids, ispirato agli altri modelli
import { Criterio } from './criterio';

export class Grids {
  key: string = '';
  nome: string = '';
  descrizione: string = '';
  criteri: Criterio[] = [];

  constructor(args?: any) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: any) {
    if (args) {
      if (Array.isArray(args.criteri)) {
        this.criteri = args.criteri.map((c: any) => new Criterio(c));
      }
      Object.assign(this, { ...args, criteri: this.criteri });
      if (typeof args.descrizione === 'string') {
        this.descrizione = args.descrizione;
      }
    }
    return this;
  }

  serialize() {
    return {
      key: this.key,
      nome: this.nome,
      descrizione: this.descrizione,
      criteri: this.criteri.map(c => c.key)
    };
  }
}
