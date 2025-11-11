export class ClasseModel{
 year: string=""
 classe: string=""
 descrizione: string=""
 note:string=""
 archived: boolean = false
 coordinatore: string=""
 segretario: string=""
 key: string=""
 constructor(args?:{}){
  this.build(args);
 }

 build(args?:{}){
  Object.assign(this, args)


  return this
}
serialize() {
  return {
    year: this.year,
    classe: this.classe,
    description: this.descrizione,
    note: this.note,
    archived: this.archived,
    coordinatore: this.coordinatore,
    segretario: this.segretario,
    key: this.key
  }
    }

    setKey(key: string){
      this.key = key
      return this
    }
}