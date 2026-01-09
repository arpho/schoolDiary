import { Grids } from "./grids";

/**
 * Modello che rappresenta una valutazione (voto o giudizio) assegnata a uno studente.
 */
export class ValutazioneModel {
    /** Identificativo univoco della valutazione */
    key?: string;
    /** Chiave dello studente valutato */
    studentKey: string = "";
    /** Chiave della classe in cui avviene la valutazione */
    classeKey: string = "";
    /** Note aggiuntive sulla valutazione */
    note: string = "";
    /** Data della valutazione */
    data: string = "";
    /** Descrizione sintetica */
    description = "";
    /** Griglia di valutazione utilizzata (se presente) */
    grid: Grids = new Grids({});

    /**
     * Costruttore della valutazione.
     * @param args Proprietà iniziali.
     */
    constructor(args?: any) {
        this.build(args);
    }

    /**
     * Serializza l'oggetto per il salvataggio.
     * @returns Oggetto JSON.
     */
    serialize(): any {
        return {
            key: this.key,
            studentKey: this.studentKey,
            classeKey: this.classeKey,
            note: this.note,
            description: this.description,
            data: this.data,
            grid: this.grid.serialize()
        };
    }

    /**
     * Imposta la chiave della valutazione.
     * @param key Chiave univoca.
     * @returns L'istanza corrente.
     */
    setKey(key: string) {
        this.key = key;
        return this;
    }

    /**
     * Costruisce l'oggetto popolando le proprietà.
     * Gestisce anche l'istanziazione della griglia se presente.
     * @param args Proprietà da assegnare.
     * @returns L'istanza corrente.
     */
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
