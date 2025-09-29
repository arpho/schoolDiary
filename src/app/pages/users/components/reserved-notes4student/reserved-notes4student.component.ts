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

  @Input() 
  set studentkey(value: string) {
    console.log('studentKey set to:', value, 'Previous value:', this._studentKey);
    if (value !== this._studentKey) {
      this._studentKey = value;
      console.log('studentKey updated, loading notes...');
      this.loadNotes();
    }
  }
  get studentkey(): string {
    return this._studentKey;
  }

  @Input() 
  set ownerkey(value: string) {
    console.log('ownerKey set to:', value, 'Previous value:', this._ownerKey);
    if (value !== this._ownerKey) {
      this._ownerKey = value;
      console.log('ownerKey updated, loading notes...');
      this.loadNotes();
    }
  }
  get ownerkey(): string {
    return this._ownerKey;
  }

  private _studentKey = '';
  private _ownerKey = '';
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

  private loadNotes() {
    console.log("loading notes 4 student", this._studentKey, "and owner", this._ownerKey);
    if (this._studentKey && this._ownerKey) {
      this.notesService.getNotesByStudentAndOwner(this._studentKey, this._ownerKey)
        .then(notes => {
          this.notes.set(notes);
        });
    }
  }

  ngOnInit() {
    console.log("ngOnInit ReservedNotes4studentComponent");
    console.log("studentkey", this._studentKey);
    console.log("ownerkey", this._ownerKey);
    
    // Load notes if we already have the required keys
    if (this._studentKey && this._ownerKey) {
      this.loadNotes();
    }
    
    // Initialize real-time updates
    this.initializeNotes();
  }

  private async initializeNotes() {
    const user = await this.usersService.getLoggedUser();
    if (user && typeof user === 'object' && 'key' in user) {
      // Use the private fields directly to ensure we have the latest values
      this.notesService.getNotesOnRealtime(user.key, this._studentKey, (notes) => {
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
