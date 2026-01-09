import { Criterio } from "./criterio";

/**
 * Modello che rappresenta un indicatore all'interno di una griglia di valutazione.
 * Un indicatore può contenere più criteri e ha un valore/voto associato.
 */
export class Indicatore {
    /** Lista di criteri associati all'indicatore */
    criteri: Criterio[] = [];
    /** Voto assegnato */
    voto: number = 0;
    /** Valore massimo o peso dell'indicatore */
    valore: string = '';
    /** Descrizione dell'indicatore */
    descrizione: string = '';

    /**
     * Costruttore dell'indicatore.
     * @param args Proprietà iniziali.
     */
    constructor(args?: any) {
        this.build(args);
    }

    /**
     * Costruisce l'oggetto popolando le proprietà e i criteri.
     * @param args Proprietà da assegnare.
     * @returns L'istanza corrente.
     */
    build(args?: any) {
        if (args) {
            if (Array.isArray(args.criteri)) {
                this.criteri = args.criteri.map((c: any) => new Criterio(c));
            }
            Object.assign(this, { ...args, criteri: this.criteri });
        }
        return this;
    }

    /**
     * Serializza l'oggetto per il salvataggio.
     * @returns Oggetto JSON.
     */
    serialize() {
        return {
            criteri: this.criteri.map(c => c.serialize()),
            voto: this.voto,
            descrizione: this.descrizione,
            valore: this.valore
        };
    }
}