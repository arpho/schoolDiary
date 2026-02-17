/**
 * Modello che rappresenta un singolo campo dell'orario scolastico.
 */
export class TimetableModel {
    key = ""
    day = "" // e.g., "Monday", "Tuesday"
    startTime = "" // e.g., "08:00"
    endTime = "" // e.g., "09:00"
    subjectKey = ""
    description = ""
    location = "" // e.g., "Room 101"
    classKey = ""
    teacherKey = ""
    as = ""

    setKey(key: string) {
        this.key = key
        return this
    }
    constructor(args?: {}) {
        this.build(args);
    }
    build(args: {} | undefined) {
        Object.assign(this, args)
        return this
    }

    serialize() {
        return {
            key: this.key,
            day: this.day,
            startTime: this.startTime,
            endTime: this.endTime,
            subjectKey: this.subjectKey,
            description: this.description,
            location: this.location,
            classKey: this.classKey,
            teacherKey: this.teacherKey,
            as: this.as
        }
    }
}
