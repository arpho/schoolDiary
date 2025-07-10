// Modello Criterio, ispirato a UserModel
import { Descrittore } from './descrittore';

export class Criterio {
  key: string = '';
  descrittori: Descrittore[] = [];

  constructor(args?: Partial<Criterio>) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: Partial<Criterio>) {
    if (args) {
      if (Array.isArray(args.descrittori)) {
        this.descrittori = args.descrittori.map(d => new Descrittore(d));
      }
      Object.assign(this, { ...args, descrittori: this.descrittori });
    }
    return this;
  }

  serialize() {
    return {
      key: this.key,
      descrittori: this.descrittori.map(d => d.key)
    };
  }
}
