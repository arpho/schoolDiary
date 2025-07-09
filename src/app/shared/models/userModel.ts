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
  classKey:string = ''
  phoneNumber = ''
  role : UsersRole = UsersRole.STUDENT
  userName = ''
  constructor(args?:{}){
    this.build(args);
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
    password: this.password,
    phoneNumber: this.phoneNumber,
    role: this.role,
    userName: this.userName
  }
}
}
