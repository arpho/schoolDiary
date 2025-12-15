export class AssignedClass{
 classKey=""
 subjectKey=""
 coordinator=""
 secretary=""
 
 constructor(args?:{}){
    this.build(args);
 }
 build(args: {} | undefined) {
    Object.assign(this, args)
    return this
}
serialize(){
    return{
        classKey: this.classKey,
        subjectKey: this.subjectKey,
        coordinator: this.coordinator,
        secretary: this.secretary
    }           
}
}