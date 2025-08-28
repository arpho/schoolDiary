import { inject } from "@angular/core";
import { UserModel } from "src/app/shared/models/userModel";
import { UsersService } from "src/app/shared/services/users.service";

export class GroupModel {
    nome: string="";
    key: string="";
    classKey: string="";
    note: string="";
    studentsKeyList: string[]=[];
    studentsList: UserModel[]=[];
    private $usersService = inject(UsersService);

    constructor(data?:{}){
        
        this.build(data);
    }

    async fetchStudents(){
    this.studentsKeyList.forEach((key) => {
        this.$usersService.getUser(key).then((user) => {
            if(user){
            this.studentsList.push(user);
            }
        });
    });
    }

    build(data?:{}){
     Object.assign(this, data);

     return this
    }
    serialize(){
        return {
            nome: this.nome,
            key: this.key,
            classKey: this.classKey,
            note: this.note,
            studentsKeyList: this.studentsKeyList,
        }
    }
}
