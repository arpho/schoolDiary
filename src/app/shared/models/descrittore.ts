// Modello Descrittore, ispirato a UserModel

export class Descrittore {
  key: string = '';
  descrizione: string = '';
  value: number = 0;

  constructor(args?: Partial<Descrittore>) {
    this.build(args);
  }

  setKey(key: string) {
    this.key = key;
    return this;
  }

  build(args?: Partial<Descrittore>) {
    Object.assign(this, args);
    return this;
  }

  serialize() {
    return {
      key: this.key,
      descrizione: this.descrizione,
      value: this.value
    };
  }
}
