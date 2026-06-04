import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AlertController, IonButton, IonIcon
} from '@ionic/angular/standalone';
import {
  add, searchOutline, closeCircle, createOutline, trashOutline,
  documentTextOutline, linkOutline, closeOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ReservedNotes4studentsService } from '../../services/reservedNotes4Students/reserved-notes4students.service';
import { UsersService } from '../../../../shared/services/users.service';
import {
  ReservedNotes4student,
  NoteCategory,
  NOTE_CATEGORIES
} from '../../models/reservedNotes4student';
import { ToasterService } from 'src/app/shared/services/toaster.service';

/**
 * Componente per la gestione delle note riservate su uno studente.
 * Card layout con categorie, ricerca, allegati.
 */
@Component({
  selector: 'app-reserved-notes4student',
  templateUrl: './reserved-notes4student.component.html',
  styleUrls: ['./reserved-notes4student.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, DatePipe],
  providers: [AlertController]
})
export class ReservedNotes4studentComponent implements OnInit {

  @Input()
  set studentkey(value: string) {
    if (value !== this._studentKey) {
      this._studentKey = value;
      this.loadNotes();
    }
  }
  get studentkey(): string { return this._studentKey; }

  @Input()
  set ownerkey(value: string) {
    if (value !== this._ownerKey) {
      this._ownerKey = value;
      this.loadNotes();
    }
  }
  get ownerkey(): string { return this._ownerKey; }

  private _studentKey = '';
  private _ownerKey = '';

  // ── State ──────────────────────────────────────────────────
  notes         = signal<ReservedNotes4student[]>([]);
  searchQuery   = signal('');
  activeCategory = signal<NoteCategory | null>(null);

  // Lista categorie disponibile nel template
  categories = NOTE_CATEGORIES;

  // Note filtrate in base a ricerca full-text e categoria
  filteredNotes = computed(() => {
    let list = this.notes();
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.activeCategory();

    if (q) {
      list = list.filter(n => {
        const categoryLabel = this.getCategoryLabel(n.category).toLowerCase();
        return (
          n.note.toLowerCase().includes(q) ||
          categoryLabel.includes(q) ||
          (n.category || 'altro').toLowerCase().includes(q) ||
          (n.attachmentUrl || '').toLowerCase().includes(q) ||
          (n.date || '').toLowerCase().includes(q)
        );
      });
    }

    if (cat) list = list.filter(n => (n.category || 'altro') === cat);
    return list;
  });


  private alertController = inject(AlertController);

  constructor(
    private toast: ToasterService,
    private $users: UsersService,
    private notesService: ReservedNotes4studentsService
  ) {
    addIcons({
      'add': add,
      'search-outline': searchOutline,
      'close-circle': closeCircle,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'document-text-outline': documentTextOutline,
      'link-outline': linkOutline,
      'close-outline': closeOutline
    });
  }

  private loadNotes() {
    if (this._studentKey && this._ownerKey) {
      this.notesService.getNotesByStudentAndOwner(this._studentKey, this._ownerKey)
        .then(notes => this.notes.set(notes));
    }
  }

  ngOnInit() {
    if (this._studentKey && this._ownerKey) {
      this.loadNotes();
    }
    this.initializeRealtime();
  }

  private async initializeRealtime() {
    const user = await this.$users.getLoggedUser();
    if (user?.key) {
      this.notesService.getNotesOnRealtime(user.key, this._studentKey, notes => {
        this.notes.set(notes);
      });
    }
  }

  // ── Ricerca e filtro ────────────────────────────────────────
  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  filterByCategory(cat: NoteCategory | null) {
    this.activeCategory.set(cat);
  }

  // ── Helpers categoria ───────────────────────────────────────
  getCategoryLabel(cat: NoteCategory | undefined): string {
    return NOTE_CATEGORIES.find(c => c.value === (cat || 'altro'))?.label || 'Altro';
  }

  getCategoryColor(cat: NoteCategory | undefined): string {
    return NOTE_CATEGORIES.find(c => c.value === (cat || 'altro'))?.color || '#757575';
  }

  // ── CRUD ────────────────────────────────────────────────────
  async addNote() {
    const alert = await this.alertController.create({
      header: 'Nuova Nota',
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: 'Testo della nota...'
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Categoria (comportamento/profitto/famiglia/salute/altro)'
        },
        {
          name: 'attachmentUrl',
          type: 'url',
          placeholder: 'Link allegato (opzionale)'
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Aggiungi',
          handler: async (data: { note: string; category: string; attachmentUrl: string }) => {
            if (!data.note) return;
            const loggedUser = await this.$users.getLoggedUser();
            const validCategories: NoteCategory[] = ['comportamento','profitto','famiglia','salute','altro'];
            const category: NoteCategory = validCategories.includes(data.category as NoteCategory)
              ? (data.category as NoteCategory)
              : 'altro';

            const note = new ReservedNotes4student()
              .setOwner(loggedUser?.key || '')
              .setNote(data.note)
              .setStudentKey(this.studentkey)
              .setDate(new Date().toISOString());
            note.category = category;
            note.attachmentUrl = data.attachmentUrl || '';

            this.notesService.addNote(note)
              .then(docRef => {
                note.setKey(docRef.id);
                this.toast.presentToast({ message: 'Nota aggiunta', duration: 2000, position: 'bottom' });
              })
              .catch(() => this.toast.presentToast({ message: 'Errore aggiunta nota', duration: 2000, position: 'bottom' }));
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteNote(noteKey: string) {
    const alert = await this.alertController.create({
      header: 'Elimina nota',
      message: 'Sei sicuro di voler eliminare questa nota?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.notesService.deleteNote(noteKey)
              .then(() => this.toast.presentToast({ message: 'Nota eliminata', duration: 2000, position: 'bottom' }))
              .catch(() => this.toast.presentToast({ message: 'Errore eliminazione', duration: 2000, position: 'bottom' }));
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
          type: 'textarea',
          value: note.note,
          placeholder: 'Testo della nota...'
        },
        {
          name: 'category',
          type: 'text',
          value: note.category || 'altro',
          placeholder: 'Categoria'
        },
        {
          name: 'attachmentUrl',
          type: 'url',
          value: note.attachmentUrl || '',
          placeholder: 'Link allegato (opzionale)'
        }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Aggiorna',
          handler: (data: { note: string; category: string; attachmentUrl: string }) => {
            if (!data.note) return;
            const validCategories: NoteCategory[] = ['comportamento','profitto','famiglia','salute','altro'];
            note.setNote(data.note);
            note.category = validCategories.includes(data.category as NoteCategory)
              ? (data.category as NoteCategory)
              : 'altro';
            note.attachmentUrl = data.attachmentUrl || '';
            this.notesService.updateNote(note.key, note)
              .then(() => this.toast.presentToast({ message: 'Nota aggiornata', duration: 2000, position: 'bottom' }))
              .catch(() => this.toast.presentToast({ message: 'Errore aggiornamento', duration: 2000, position: 'bottom' }));
          }
        }
      ]
    });
    await alert.present();
  }
}
