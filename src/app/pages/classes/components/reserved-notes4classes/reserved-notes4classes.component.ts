import { Component, Input, OnInit, computed, inject, input } from '@angular/core';
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

  classe = input.required<ClasseModel>();
  classkey = computed(() => this.classe().key);
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
    console.log("note per classe", this.classe());
    this.initializeNotes();
  }

  private async initializeNotes() {
    const loggedUser = await this.usersService.getLoggedUser();
    console.log("logged user", loggedUser);
    console.log(`classKey ${this.classkey()}`)
    if (loggedUser && typeof loggedUser === 'object' && 'key' in loggedUser) {
      this.classReservedNotesService.getNotesOnRealtime(loggedUser.key,this.classkey(), (notes) => {
        console.log(`notes per classe ${this.classkey()} per utente ${loggedUser.key}`, notes);
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
                .setClassKey(this.classkey())
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
