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
  IonFab,
  IonFabButton,
  IonFabList,
  IonBackButton,
AlertController,
IonInput } from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
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
    IonInput
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadStudentsComponent  implements OnInit {
  private _classkey = '';
  set classkey(value: string) { this._classkey = value; }
  get classkey() { return this._classkey; }
  alunni = signal<Alunno[]>([]);

  constructor(
    private alertCtrl: AlertController
  ) { }

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
      console.log('Excel data:', this.excelData);
      
      // Resetta la lista degli alunni
      this.alunni.set([]);
      
      // Processa ogni studente
      this.excelData.forEach((student: any) => {
   console.log("alunno", student['Lista schede alunno'])
      const nomeCognome = student['Lista schede alunno'].split("    ")[3]?.trim();
      const firstName = nomeCognome?.split(" ")[0];
      const lastName = nomeCognome?.split(" ")[1];
      const alunno = new Alunno({
        firstName: firstName || '',
        lastName: lastName || '',
        role: UsersRole.STUDENT,
        classKey: this.classkey,
        password: this.generatePassword()
      });
      
      // Aggiungi l'alunno alla lista
      this.alunni.update(current => [...current, alunno])
   console.log("nome", firstName)
   console.log("cognome", lastName)
   console.log("------------------------------------------------------")


  
      });
    };
    reader.readAsBinaryString(file);
  }

  ngOnInit() {}

}
