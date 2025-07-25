import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AlertController, IonButton, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonCard, IonFab, IonFabButton, IonIcon, IonFabList } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { ReservedNotes4studentsService } from '../../services/reservedNotes4Students/reserved-notes4students.service';
import { UsersService } from '../../../../shared/services/users.service';
import { ReservedNotes4student } from '../../models/reservedNotes4student';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { archive, create, ellipsisVertical, eye, sparkles, close } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-reserved-notes4student',
  templateUrl: './reserved-notes4student.component.html',
  styleUrls: ['./reserved-notes4student.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonLabel,
    IonItem,
    CommonModule,
    IonButton,
    IonCard,
    IonFab,
    IonFabButton,
    IonIcon,
    IonFabList,
    DatePipe
  ],
  providers: [AlertController]
})
export class ReservedNotes4studentComponent implements OnInit {
  @Input() studentkey!: string;
  @Input() ownerkey!: string;
  notes = signal<ReservedNotes4student[]>([]);
  constructor(
    private toast: ToasterService,
    private $users: UsersService,
    private notesService: ReservedNotes4studentsService,
    private usersService: UsersService
  ) {
    console.log("constructor ReservedNotes4studentComponent");
    addIcons({
      ellipsisVertical,
      create,
      eye,
      sparkles,
      close,
      archive,
    })
  }

  ngOnInit() {
    this.initializeNotes();
  }

  private async initializeNotes() {
    const user = await this.usersService.getLoggedUser();
    if (user && typeof user === 'object' && 'key' in user) {
      this.notesService.getNotesOnRealtime(user.key, this.studentkey, (notes) => {
        this.notes.set(notes);
      });
    }
  }

  private alertController = inject(AlertController);

  async addNote() {
    const alert = await this.alertController.create({
      header: 'Nuova Nota',
      inputs: [
        {
          name: 'note',
          type: 'text',
          placeholder: 'Inserisci la nota'
        }
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Aggiungi',
          handler: async (data: { note: string }) => {
            if (data.note) {
              const loggedUser = await this.$users.getLoggedUser();
              const note = new ReservedNotes4student()
                .setOwner(loggedUser?.key ? loggedUser.key : "")
                .setNote(data.note)
                .setStudentKey(this.studentkey)
                .setDate(new Date().toISOString());
                console.log("note", note);
              
              this.notesService.addNote(note).then((docRef) => {
                this.toast.presentToast({message:"Nota aggiunta con successo",duration:2000,position:"bottom"});
                console.log("nota creata", note);
                note.setKey(docRef.id);
              }).catch((error) => {
                this.toast.presentToast({message:"Errore durante l'aggiunta della nota",duration:2000,position:"bottom"});
                console.log("errore durante l'aggiunta della nota", error);
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteNote(noteKey: string) {
    const alert = await this.alertController.create({
      header: 'Conferma',
      message: 'Sei sicuro di voler eliminare la nota?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina',
          handler: () => {
            this.notesService.deleteNote(noteKey).then(() => {
              this.toast.presentToast({message:"Nota eliminata con successo",duration:2000,position:"bottom"});
              console.log("nota eliminata", noteKey);
            }).catch((error) => {
              this.toast.presentToast({message:"Errore durante l'eliminazione della nota",duration:2000,position:"bottom"});
              console.log("errore durante l'eliminazione della nota", error);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async updateNote(note: ReservedNotes4student) {
    const alert = await this.alertController.create({
      header: 'Modifica Nota',
      inputs: [
        {
          name: 'note',
          type: 'text',
          placeholder: 'Inserisci la nota',
          value: note.note
        }
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Aggiorna',
          handler: async (data: { note: string }) => {
            if (data.note) {
              note.setNote(data.note);
              this.notesService.updateNote(note.key, note).then(() => {
                this.toast.presentToast({message:"Nota aggiornata con successo",duration:2000,position:"bottom"});
                console.log("nota aggiornata", note);
              }).catch((error) => {
                this.toast.presentToast({message:"Errore durante l'aggiornamento della nota",duration:2000,position:"bottom"});
                console.log("errore durante l'aggiornamento della nota", error);
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
