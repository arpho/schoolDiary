import { ClasseModel } from "src/app/pages/classes/models/classModel";
import { UsersRole } from "./usersRole";


export class UserModel{
  setKey(uid: string) {
  this.key = uid;
  return this
  }
  key = ''
  birthDate: string|number = ''
  email = ''
  firstName = ''
  lastName = ''
  password = ''
  classKey: string = ''
  phoneNumber = ''
  role: UsersRole = UsersRole.STUDENT
  userName = ''
  classi:ClasseModel[] = []
  classesKey: string[] = []
set classes (classes:string[]) {
  this.classesKey = classes;
}
get classes () {
  return this.classesKey;
}
  constructor(args?:{}){
    this.build(args);
  }
  set classe(classe: string) {
    this.classKey = classe;
  }

  get classe() {
    return this.classKey;
  }
  build(args?:{}){
    Object.assign(this, args)



    return this

}
serialize(){
  return{
    key: this.key,
    birthDate: this.birthDate,
    classKey: this.classKey,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    role: this.role,
    userName: this.userName,
    classes: this.classi.map((classe) => classe.key)
  }
}
}
