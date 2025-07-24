export class ReservedNotes4class {
 ownerKey="";
 note="";
 key="";
 date="";

 constructor(args?: any){
  this.build(args);
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
  this.key = args.key;
  this.note = args.note;
  this.ownerKey = args.owner;
  this.date = args.date;
  return this
}
serialize(){
  return {
    key: this.key,
    note: this.note,
    ownerKey: this.ownerKey,
    date: this.date
  }
}   
}