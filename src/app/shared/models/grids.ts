// Modello Grids, ispirato agli altri modelli
import { Indicatore } from './indicatore';

export class Grids {
  key: string = '';
  nome: string = '';
  descrizione: string = '';
  indicatori: Indicatore[] = [];

  constructor(args?: any) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: any) {
    if (args) {
      if (Array.isArray(args.indicatori)) {
        this.indicatori = args.indicatori.map((c: any) => new Indicatore(c));
      }
      Object.assign(this, { ...args, indicatori: this.indicatori });
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
      indicatori: this.indicatori.map(c => c.serialize())
    };
  }
}
