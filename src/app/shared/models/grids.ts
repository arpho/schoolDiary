// Modello Grids, ispirato agli altri modelli
import { Criterio } from './criterio';

export class Grids {
  key: string = '';
  nome: string = '';
  criteri: Criterio[] = [];

  constructor(args?: Partial<Grids>) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: Partial<Grids>) {
    if (args) {
      if (Array.isArray(args.criteri)) {
        this.criteri = args.criteri.map(c => new Criterio(c));
      }
      Object.assign(this, { ...args, criteri: this.criteri });
    }
    return this;
  }

  serialize() {
    return {
      key: this.key,
      nome: this.nome,
      criteri: this.criteri.map(c => c.key)
    };
  }
}
