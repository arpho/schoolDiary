import { ToasterService } from 'src/app/shared/services/toaster.service';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, input, signal, computed } from '@angular/core';
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
  IonText,
  AlertController,
  IonInput
} from '@ionic/angular/standalone';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { UsersService } from '../../../../../shared/services/users.service';
import { addIcons } from 'ionicons';
import { pushOutline } from 'ionicons/icons';
import { Alunno } from '../../../models/alunno.model';

@Component({
  selector: 'app-upload-students',
  templateUrl: './upload-students.component.html',
  styleUrls: ['./upload-students.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    IonText
  ]
})
export class UploadStudentsComponent implements OnInit {
  constructor(
    private alertCtrl: AlertController,
    private $userService: UsersService,
    private $toaster: ToasterService
  ) {
    addIcons({
      push: pushOutline,
    })
  }

  isEmailValid(email: string): boolean {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  }

  async push() {
    console.log("push to class", this.classkey);
    const validAlunni = this.alunni().filter((alunno: Alunno) => alunno.firstName && alunno.lastName);

    const promises = validAlunni.map((alunno: Alunno) => {
      alunno.email = this.emailFactory(alunno);
      console.log("alunno", alunno);
      return this.$userService.createUser(alunno)
        .then((userKey) => ({ success: true, alunno }))
        .catch((error) => ({ success: false, alunno, error }));
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      this.$toaster.presentToast({ message: `${successCount} studenti creati con successo.`, position: 'top', duration: 3000 });
    }

    if (failCount > 0) {
      this.$toaster.presentToast({ message: `${failCount} studenti non creati. Controlla la console.`, position: 'top', duration: 5000 });
      console.error("Failed uploads:", results.filter(r => !r.success));
    }
  }
  private _classkey = '';
  set classkey(value: string) { this._classkey = value; }
  get classkey() { return this._classkey; }
  alunni = signal<Alunno[]>([]);

  // Check if any email is invalid
  hasInvalidEmails = computed(() => {
    return this.alunni().some(alunno =>
      alunno.firstName &&
      alunno.lastName &&
      !this.isEmailValid(this.emailFactory(alunno))
    );
  });

  // Get list of invalid emails for display
  invalidEmailsList = computed(() => {
    return this.alunni()
      .filter(alunno =>
        alunno.firstName &&
        alunno.lastName &&
        !this.isEmailValid(this.emailFactory(alunno))
      )
      .map(alunno => this.emailFactory(alunno));
  });

  /**
   * Genera l'email istituzionale standard per uno studente (nome.cognome...).
   */
  emailFactory(alunno: Alunno) {
    return `${alunno.firstName.toLowerCase()}.${alunno.lastName.toLowerCase()}.studenti@iiscuriesraffa.it`;
  }

  /**
   * Apre un dialog per correggere nome e cognome di uno studente parsato male.
   */
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

  /**
   * Gestisce il caricamento del file Excel e ne parsa il contenuto.
   */
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
        const firstName = nomeCognome?.split(" ")[1];
        const lastName = nomeCognome?.split(" ")[0];
        const alunno = new Alunno({
          firstName: firstName || '',
          lastName: lastName || '',
          role: UsersRole.STUDENT,
          classKey: this.classkey,
          password: this.generatePassword()
        }).setClassKey(this.classkey).setFullName(student['Lista schede alunno'].split("    ")[3]?.trim() || '');


        // Aggiungi l'alunno alla lista
        this.alunni.update(current => [...current, alunno])



      });
    };
    reader.readAsBinaryString(file);
  }

  ngOnInit() { }

}
