// Modello Criterio, ispirato a UserModel
import { Descrittore } from './descrittore';

export class Criterio {
  key: string = '';
  descrizione: string = '';
  rangeValue: string = '';

  constructor(args?: any) {
    this.build(args);
  }

  build(args?: any) {
    if (args) {
      Object.assign(this, args);
    }
    return this;
  }

  serialize() {
    return {
      key: this.key,
        descrizione: this.descrizione,
        rangeValue: this.rangeValue
    };
  }
}
