import { Grids } from "./grids";

export class ValutazioneModel {
    key?: string;
    studentKey: string="";
    classeKey: string="";
    note: string="";
    data: string="";
    grid: Grids=new Grids({});
    constructor(args?: any) {
        this.build(args);
    }
    serialize(): any {
        return {
            key: this.key,
            studentKey: this.studentKey,
            classeKey: this.classeKey,
            note: this.note,
            data: this.data,
            grid: this.grid.serialize()
        };
    }   
    setKey(key: string) {
        this.key = key;
        return this;
    }
    build(args?: any) {
        if (args) {
            Object.assign(this, args);
            if (args.grid) {
                this.grid = new Grids(args.grid);
            }
        }
        return this;
    }
}
