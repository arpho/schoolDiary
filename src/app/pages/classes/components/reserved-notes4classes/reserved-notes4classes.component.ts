import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AlertController, IonButton, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonCard, IonFab, IonFabButton, IonIcon, IonFabList } from '@ionic/angular/standalone';
import { ClasseModel } from '../../models/classModel';
import { signal } from '@angular/core';
import { ClassReservedNotesService } from '../../services/classReservedNotes/class-reserved-notes.service';
import { UsersService } from '../../../../shared/services/users.service';
import { ReservedNotes4class } from '../../models/reservedNotes4class';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { archive, create, ellipsisVertical, eye, sparkles,close } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-reserved-notes4classes',
  templateUrl: './reserved-notes4classes.component.html',
  styleUrls: ['./reserved-notes4classes.component.scss'],
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
    IonFabList
],
  providers: [AlertController]
})
export class ReservedNotes4ClassesComponent implements OnInit {

  @Input() classe!: ClasseModel;
  notes = signal<ReservedNotes4class[]>([]);
  private classReservedNotesService = inject(ClassReservedNotesService);
  private usersService = inject(UsersService);
  constructor(
    private toast: ToasterService,
    private $users:UsersService
  ) {
    console.log("constructor ReservedNotes4ClassesComponent");
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
      this.classReservedNotesService.getNotesOnRealtime(user.key,this.classe.key, (notes) => {
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
              const note = new ReservedNotes4class()
                .setOwner(loggedUser?.key?loggedUser.key:"")
                .setNote(data.note)
                .setClassKey(this.classe.key)
                .setDate(new Date().toISOString());
                console.log("note", note);
              
              this.classReservedNotesService.addNote(note).then((docRef) => {
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
            this.classReservedNotesService.deleteNote(noteKey).then(() => {
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

  async updateNote(note: ReservedNotes4class) {
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
              this.classReservedNotesService.updateNote(note.key, note).then(() => {
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
