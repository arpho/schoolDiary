import { UserModel } from 'src/app/shared/models/userModel';

export class Alunno extends UserModel {
  fullName: string = '';
  
  constructor(args?: Partial<Alunno>) {
    super(args);
    if (args) {
      this.fullName = args.fullName || '';
    }
  }

  setFullName(fullName: string): this {
    this.fullName = fullName;
    return this;
  }
}

export interface IAlunno extends Partial<Alunno> {}
