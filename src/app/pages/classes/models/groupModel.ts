import { UserModel } from "src/app/shared/models/userModel";
import { UsersService } from "src/app/shared/services/users.service";

export class GroupModel {
    nome: string = "";
    key: string = "";
    classKey: string = "";
    note: string = "";
    description: string = "";
    studentsKeyList: string[] = [];
    studentsList: UserModel[] = [];
    private $usersService: UsersService | undefined;
    createdAt: string = new Date().toISOString();
    updatedAt: string = new Date().toISOString();

    constructor(data?: any, usersService?: UsersService) {
        if(usersService){
        this.$usersService = usersService;
        }
        this.build(data);
    }

    async fetchStudents() {
        if (!this.$usersService) {
            throw new Error('UsersService is required to fetch students');
        }
        
        const students = await Promise.all(
            this.studentsKeyList.map(key => this.$usersService?.getUser(key))
        );
        
        this.studentsList = students.filter((user): user is UserModel => user !== null);
    }
    setKey(key: string){
        this.key = key
        return this
    }

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
    serialize(){
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
