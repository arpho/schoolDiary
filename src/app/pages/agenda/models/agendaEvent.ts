export type EventType = 'homework' | 'test' | 'interrogation' | 'note' | 'meeting' | 'other';

/**
 * Interfaccia base per un evento dell'agenda.
 */
export interface IAgendaEvent {
    key?: string;
    id?: string;
    title: string;
    description: string;
    dataInizio: string; // ISO string
    dataFine: string;   // ISO string
    classKey: string;
    teacherKey: string;
    type: EventType;
    targetClasses?: string[]; // Array di chiavi o ID delle classi target
    creationDate: number;
    allDay: boolean;
    // Campi legacy per retrocompatibilità
    date?: string;
}

/**
 * Classe che rappresenta un evento dell'agenda scolastica.
 * Gestisce titolo, descrizione, date, tipo e assegnazione alle classi.
 */
export class AgendaEvent implements IAgendaEvent {
    key: string = '';
    id: string = '';
    title: string = '';
    description: string = '';
    dataInizio: string = ''; // ISO string
    dataFine: string = '';   // ISO string
    classKey: string = '';
    done: boolean = false;
    teacherKey: string = '';
    type: EventType = 'other';
    targetClasses: string[] = []; // Array di chiavi o ID delle classi target
    creationDate: number = Date.now();
    allDay: boolean = false; // Per eventi che durano tutto il giorno

    /**
     * Costruttore: Inizializza l'evento, gestendo la compatibilità con vecchi formati di data.
     * @param args Oggetto parziale con i dati dell'evento.
     */
    constructor(args?: Partial<AgendaEvent>) {
        if (args) {
            // Se c'è un vecchio campo 'date', usalo per entrambi dataInizio e dataFine
            if ('date' in args && !('dataInizio' in args)) {
                this.dataInizio = args.date as string;
                this.dataFine = args.date as string;
                // Rimuovi il campo date per evitare sovrascritture indesiderate
                const { date, ...rest } = args;
                Object.assign(this, rest);
            } else {
                Object.assign(this, args);
            }
        }
    }

    /**
     * Builder pattern per l'inizializzazione o aggiornamento.
     * @param args Oggetto parziale con i dati.
     * @returns L'istanza corrente.
     */
    build(args?: Partial<AgendaEvent>) {
        if (args) {
            // Se c'è un vecchio campo 'date', usalo per entrambi dataInizio e dataFine
            if ('date' in args && !('dataInizio' in args)) {
                this.dataInizio = args.date as string;
                this.dataFine = args.date as string;
                // Rimuovi il campo date per evitare sovrascritture indesiderate
                const { date, ...rest } = args;
                Object.assign(this, rest);
            } else {
                Object.assign(this, args);
            }
        }
        return this;
    }

    /**
     * Imposta la chiave dell'evento.
     * @param key Chiave univoca.
     * @returns L'istanza corrente.
     */
    setKey(key: string) {
        this.key = key;
        return this;
    }

    /**
     * Serializza l'oggetto per il salvataggio su database.
     * @returns Oggetto plain.
     */
    serialize(): Record<string, any> {
        return {
            key: this.key,
            id: this.id,
            done: this.done,
            title: this.title,
            description: this.description,
            dataInizio: this.dataInizio,
            dataFine: this.dataFine,
            classKey: this.classKey,
            teacherKey: this.teacherKey,
            type: this.type,
            targetClasses: this.targetClasses,
            creationDate: this.creationDate,
            allDay: this.allDay
        };
    }

    /**
     * Verifica se l'evento inizia e finisce nello stesso giorno.
     * @returns True se è lo stesso giorno.
     */
    isSameDay(): boolean {
        if (!this.dataInizio || !this.dataFine) return false;
        const start = new Date(this.dataInizio).setHours(0, 0, 0, 0);
        const end = new Date(this.dataFine).setHours(0, 0, 0, 0);
        return start === end;
    }

    /**
     * Calcola la durata dell'evento in millisecondi.
     * @returns Durata in ms.
     */
    getDuration(): number {
        if (!this.dataInizio || !this.dataFine) return 0;
        return new Date(this.dataFine).getTime() - new Date(this.dataInizio).getTime();
    }
}
