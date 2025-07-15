export class ClasseModel{
 year: string=""
 classe: string=""
 descrizione: string=""
 note:string=""
 key: string=""
 constructor(args?:{}){
  this.build(args);
 }

 build(args?:{}){
  Object.assign(this, args)


  return this
}   
serialize(){
  return{
    year: this.year,
    classe: this.classe,
    description: this.descrizione,
    note: this.note,
    key: this.key
  }
    }

    setKey(key: string){
      this.key = key
      return this
    }
}