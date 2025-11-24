export class AgendaEvent {
    key: string = '';
    title: string = '';
    description: string = '';
    date: string = ''; // ISO string or timestamp
    classKey: string = '';
    teacherKey: string = '';
    type: 'homework' | 'test' | 'interrogation' | 'note' | 'other' = 'other';
    creationDate: number = Date.now();

    constructor(args?: { [key: string]: any }) {
        this.build(args);
    }

    build(args?: { [key: string]: any }) {
        Object.assign(this, args);
        return this;
    }

    setKey(key: string) {
        this.key = key;
        return this;
    }

    serialize() {
        return {
            key: this.key,
            title: this.title,
            description: this.description,
            date: this.date,
            classKey: this.classKey,
            teacherKey: this.teacherKey,
            type: this.type,
            creationDate: this.creationDate
        };
    }
}
