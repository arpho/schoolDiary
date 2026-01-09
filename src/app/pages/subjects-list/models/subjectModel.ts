/**
 * Modello che rappresenta una materia scolastica.
 */
export class SubjectModel {
    key = ""
    name = ""
    description = ""
    color = ""
    classeDiConcorso = ""
    icon = ""
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
            name: this.name,
            description: this.description,
            color: this.color,
            classeDiConcorso: this.classeDiConcorso,
            icon: this.icon
        }
    }
}
