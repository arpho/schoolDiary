export type EventType = 'homework' | 'test' | 'interrogation' | 'note' | 'meeting' | 'other';

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

    setKey(key: string) {
        this.key = key;
        return this;
    }

    // Metodo per convertire l'oggetto in un formato serializzabile
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

    // Helper methods
    isSameDay(): boolean {
        if (!this.dataInizio || !this.dataFine) return false;
        const start = new Date(this.dataInizio).setHours(0, 0, 0, 0);
        const end = new Date(this.dataFine).setHours(0, 0, 0, 0);
        return start === end;
    }

    // Restituisce la durata in millisecondi
    getDuration(): number {
        if (!this.dataInizio || !this.dataFine) return 0;
        return new Date(this.dataFine).getTime() - new Date(this.dataInizio).getTime();
    }
}
