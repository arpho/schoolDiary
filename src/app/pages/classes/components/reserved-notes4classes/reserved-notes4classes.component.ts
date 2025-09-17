import { 
  Component, 
  OnInit, 
  OnDestroy, 
  input, 
  inject, 
  computed, 
  signal, 
  effect 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Importing icons from ionicons package
import { 
  ellipsisVertical,
  create,
  eye,
  sparkles,
  close,
  archive,
  trash
} from 'ionicons/icons';

import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ClasseModel } from '../../models/classModel';
import { ClassReservedNotesService } from '../../services/classReservedNotes/class-reserved-notes.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ReservedNotes4class } from '../../models/reservedNotes4class';

// Import dei componenti Ionic standalone
import { 
  IonButton, 
  IonList, 
  IonLabel, 
  IonCard, 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonFabList 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-reserved-notes4classes',
  templateUrl: './reserved-notes4classes.component.html',
  styleUrls: ['./reserved-notes4classes.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonList,
    IonLabel,
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
  private loggedUser = signal<any>(null);
  private unsubscribe: (() => void) | null = null;
  isLoading = signal<boolean>(true);

  constructor(
    private toast: ToasterService,
    private $users: UsersService
  ) {
    console.log("constructor ReservedNotes4ClassesComponent");
    // Registering icons for use in the template
    // Note: In newer versions of Ionic, icons are automatically registered
    // This is kept for backward compatibility
    try {
      addIcons({
        ellipsisVertical,
        create,
        eye,
        sparkles,
        close,
        archive,
        trash
      });
    } catch (error) {
      console.warn('Icons already registered or not available in this version of Ionic');
    }

    // Effect che si attiva quando loggedUser o classkey cambiano
    effect(async () => {
      const user = this.loggedUser();
      const classKey = this.classkey();
      
      // Disattiva la sottoscrizione precedente se esiste
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      // Se abbiamo sia l'utente che la classe, carichiamo le note
      if (user && classKey) {
        this.isLoading.set(true);
        console.log(`Caricamento note per classe ${classKey} per utente ${user.key}`);
        this.unsubscribe = this.classReservedNotesService.getNotesOnRealtime(
          user.key,
          classKey,
          (notes) => {
            console.log(`Note caricate per classe ${classKey}:`, notes);
            this.notes.set(notes);
            this.isLoading.set(false);
          }
        );
      } else {
        this.notes.set([]);
        this.isLoading.set(false);
      }
    });
  }

  async ngOnInit() {
    try {
      console.log("note per classe", this.classe());
      await this.initializeUser();
    } catch (error) {
      console.error('Errore durante l\'inizializzazione del componente:', error);
      this.toast.presentToast({ 
        message: 'Errore durante il caricamento delle note',
        duration: 2000,
        position: 'bottom' 
      });
    }
  }

  private async initializeUser() {
    try {
      const user = await this.usersService.getLoggedUser();
      console.log("Utente loggato:", user);
      if (user && typeof user === 'object' && 'key' in user) {
        this.loggedUser.set(user);
      }
    } catch (error) {
      console.error('Errore nel caricamento dell\'utente:', error);
      this.isLoading.set(false);
    }
  }

  ngOnDestroy() {
    // Assicurati di annullare la sottoscrizione quando il componente viene distrutto
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private alertController = inject(AlertController);
  note = '';

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
            if (data?.note) {
              try {
                const loggedUser = await this.$users.getLoggedUser();
                const note = new ReservedNotes4class()
                  .setOwner(loggedUser?.key || '')
                  .setNote(data.note)
                  .setClassKey(this.classkey())
                  .setDate(new Date().toISOString());
                
                await this.classReservedNotesService.addNote(note);
                this.toast.presentToast({
                  message: 'Nota aggiunta con successo',
                  duration: 2000,
                  position: 'bottom'
                });
              } catch (error) {
                console.error("Errore durante l'aggiunta della nota:", error);
                this.toast.presentToast({
                  message: "Errore durante l'aggiunta della nota",
                  duration: 2000,
                  position: 'bottom'
                });
              }
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
              this.toast.presentToast({
                message: 'Nota eliminata con successo',
                duration: 2000,
                position: 'bottom'
              });
            }).catch((error: Error) => {
              console.error("Errore durante l'eliminazione della nota:", error);
              this.toast.presentToast({
                message: "Errore durante l'eliminazione della nota",
                duration: 2000,
                position: 'bottom'
              });
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
          value: note.note,
          placeholder: 'Inserisci la nota'
        }
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Salva',
          handler: async (data: { note: string }) => {
            if (data?.note) {
              try {
                const updatedNote = new ReservedNotes4class()
                  .setKey(note.key || '')
                  .setNote(data.note)
                  .setOwner(note.ownerKey || '')
                  .setClassKey(note.classKey || '')
                  .setDate(note.date || new Date().toISOString());
                
                // Pass both key and note to the update method
                await this.classReservedNotesService.updateNote(updatedNote.key || '', updatedNote);
                this.toast.presentToast({
                  message: 'Nota aggiornata con successo',
                  duration: 2000,
                  position: 'bottom'
                });
              } catch (error) {
                console.error("Errore durante l'aggiornamento della nota:", error);
                this.toast.presentToast({
                  message: "Errore durante l'aggiornamento della nota",
                  duration: 2000,
                  position: 'bottom'
                });
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
