import { ClasseModel } from "../../classes/models/classModel";

export class AssignedClass extends ClasseModel{
 subjectsKey:string[]=[]
 coordinator=""
 secretary=""
 
 constructor(args?:{}){
    super(args)
    this.build(args);
 }
 override build(args: {} | undefined) {
    Object.assign(this, args)
    return this
}
    override serialize(){
    return{
        ...super.serialize(),
        subjectsKey: this.subjectsKey,
        coordinator: this.coordinator,
        secretary: this.secretary
    }           
}
}