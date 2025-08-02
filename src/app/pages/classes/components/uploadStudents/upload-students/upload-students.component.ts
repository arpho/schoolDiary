import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, input, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import { 
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonButton,
  IonButtons,
AlertController,
IonInput } from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { UsersService } from '../../../../../shared/services/users.service';
import { addIcons } from 'ionicons';
import { pushOutline } from 'ionicons/icons';

 class Alunno extends UserModel {

  
  constructor(args?: {}) {
    super(args);
  }
}
@Component({
  selector: 'app-upload-students',
  templateUrl: './upload-students.component.html',
  styleUrls: ['./upload-students.component.scss'],
  imports: [
    IonList,
    IonItem,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
      IonButton,
      IonIcon,
      IonButtons,
],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadStudentsComponent  implements OnInit {
push() {
console.log("push to class", this.classkey)
this.alunni().forEach((alunno: Alunno) => {
console.log("alunno", alunno)
alunno.email = this.emailFactory(alunno)

this.$userService.signupUser(alunno).then((userKey) => {
  console.log("userKey", userKey)
const claims = {
  role: alunno.role,
  classKey: alunno.classKey,
}
this.$userService.setUserClaims2user(userKey, claims)

  console.log("alunno creato", alunno)
}).catch((error) => {
  console.log("error", error)
})
})
}
  private _classkey = '';
  set classkey(value: string) { this._classkey = value; }
  get classkey() { return this._classkey; }
  alunni = signal<Alunno[]>([]);

  constructor(
    private alertCtrl: AlertController,
    private $userService: UsersService
  ) {
    addIcons({
      push: pushOutline,
    })
   }

  emailFactory(alunno: Alunno) {
    return `${alunno.firstName.toLowerCase()}.${alunno.lastName.toLowerCase()}.studenti@iiscuriesraffa.it`;
  }
async fixName(alunno: Alunno, index: number) {
  const alert = await this.alertCtrl.create({
    header: 'Fix Name',
    inputs: [
      {
        name: 'firstName',
        type: 'text',
        value: alunno.firstName,
        placeholder: 'Inserisci il nome',
      },
      {
        name: 'lastName',
        type: 'text',
        placeholder: 'Inserisci il cognome',
        value: alunno.lastName
      }
    ],
    buttons: [
      {
        text: 'Annulla',
        role: 'cancel'
      },
      {
        text: 'Aggiorna',
        handler: async (data: { firstName: string, lastName: string }) => {
          const updatedAlunno = new Alunno({
            ...alunno,
            firstName: data.firstName,
            lastName: data.lastName
          });
          console.log("updatedAlunno", updatedAlunno)
          this.alunni.set(this.alunni().map((a, i) => i === index ? updatedAlunno : a));
        }
      }
    ]
  });

  await alert.present();
}

  excelData: any[] = [];

  generatePassword(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      
      // Resetta la lista degli alunni
      this.alunni.set([]);
      
      // Processa ogni studente
      this.excelData.forEach((student: any) => {
      const nomeCognome = student['Lista schede alunno'].split("    ")[3]?.trim();
      const firstName = nomeCognome?.split(" ")[0];
      const lastName = nomeCognome?.split(" ")[1];
      const alunno = new Alunno({
        firstName: firstName || '',
        lastName: lastName || '',
        role: UsersRole.STUDENT,
        classKey: this.classkey,
        password: this.generatePassword()
      }).setClassKey(this.classkey);
    
      
      // Aggiungi l'alunno alla lista
      this.alunni.update(current => [...current, alunno])


  
      });
    };
    reader.readAsBinaryString(file);
  }

  ngOnInit() {}

}
