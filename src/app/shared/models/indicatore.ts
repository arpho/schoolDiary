import { Criterio } from "./criterio";

export class Indicatore{
    criteri: Criterio[] = [];
    voto: number = 0;
    valore: string = '';
    descrizione: string = '';
    
    constructor(args?: any){
        this.build(args);
    }
    
    build(args?: any){
        if(args){
            if(Array.isArray(args.criteri)){
                this.criteri = args.criteri.map((c: any) => new Criterio(c));
            }
            Object.assign(this, { ...args, criteri: this.criteri });
        }
        return this;
    }
    
    serialize(){
        return {
                criteri: this.criteri.map(c => c.serialize()),
            voto: this.voto,
            descrizione: this.descrizione
        };
    }
}