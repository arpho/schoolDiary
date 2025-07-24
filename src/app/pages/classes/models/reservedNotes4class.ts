export class ReservedNotes4class {
 ownerKey="";
 note="";
 classKey="";
 key="";
 date="";

 constructor(args?: any){
  this.build(args);
 }
  setClassKey(key: string) {
    this.classKey = key
    return this
  }
 setKey(key: string){
  this.key = key
  return this
}
setNote(note: string){
  this.note = note
  return this
}
setOwner(owner: string){
  this.ownerKey = owner
  return this
}
setDate(date: string){
  this.date = date
  return this
}   
build(args: any){
  Object.assign(this, args)
  return this
}
serialize(){
  return {
    key: this.key,
    note: this.note,
    ownerKey: this.ownerKey,
    classKey: this.classKey,
    date: this.date
  }
}   
}