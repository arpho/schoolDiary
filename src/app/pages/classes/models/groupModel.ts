import { UserModel } from "src/app/shared/models/userModel";
import { UsersService } from "src/app/shared/services/users.service";

/**
 * Modello che rappresenta un Gruppo di studenti.
 */
export class GroupModel {
    /** Nome del gruppo */
    nome: string = "";
    /** Chiave univoca del gruppo */
    key: string = "";
    /** Chiave della classe di appartenenza */
    classKey: string = "";
    /** Note sul gruppo */
    note: string = "";
    /** Descrizione del gruppo */
    description: string = "";
    /** Lista delle chiavi degli studenti nel gruppo */
    studentsKeyList: string[] = [];
    /** Lista dei modelli User degli studenti (popolata asincronamente) */
    studentsList: UserModel[] = [];
    readonly $usersService: UsersService | undefined;
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();

    constructor(data?: any, usersService?: UsersService) {
        if (usersService) {
            this.$usersService = usersService;
        }
        this.build(data);
    }

    /**
     * Recupera i dettagli completi degli studenti partendo dalle loro chiavi.
     * Richiede che UsersService sia stato passato nel costruttore.
     */
    async fetchStudents() {
        if (!this.$usersService) {
            throw new Error('UsersService is required to fetch students');
        }

        const students = await Promise.all(
            this.studentsKeyList.map(key => this.$usersService?.getUser(key))
        );

        this.studentsList = students.filter((user): user is UserModel => user !== null);
    }

    /**
     * Imposta la chiave del gruppo.
     */
    setKey(key: string) {
        this.key = key
        return this
    }

    /**
     * Costruisce l'oggetto.
     */
    build(data?: any) {
        if (data) {
            this.nome = data.nome || this.nome;
            this.key = data.key || this.key;
            this.classKey = data.classKey || this.classKey;
            this.note = data.note || this.note;
            this.studentsKeyList = data.studentsKeyList || this.studentsKeyList;
            this.createdAt = data.createdAt || this.createdAt;
            this.updatedAt = data.updatedAt || this.updatedAt;
            this.description = data.description || this.description;
        }
        return this;
    }

    /**
     * Serializza il gruppo per il salvataggio o l'invio.
     */
    serialize() {
        return {
            nome: this.nome,
            key: this.key,
            classKey: this.classKey,
            note: this.note,
            description: this.description,
            studentsKeyList: this.studentsList.map(user => user.key),
        }
    }
}
