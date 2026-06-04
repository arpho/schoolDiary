import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  accessibilityOutline, documentTextOutline,
  add, trash, openOutline, copyOutline, linkOutline
} from 'ionicons/icons';
import {
  IonList, IonItem, IonLabel, IonInput, IonButton,
  IonIcon, IonGrid, IonRow, IonCol, IonTextarea, IonNote
} from '@ionic/angular/standalone';
import { DocumentModel } from 'src/app/pages/classes/models/documentModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';

/** Dati disabilità + PDP emessi verso il genitore */
export interface DisabilityData {
  DVA: boolean;
  DSA: boolean;
  BES: boolean;
  ADHD: boolean;
  noteDisabilita: string;
  pdpUrl: DocumentModel[];
}

/**
 * Componente dedicato alla gestione di:
 * - Chip disabilità (DVA, DSA, BES, ADHD)
 * - Note disabilità
 * - Lista documenti PDP con open/copy/delete e anteprima link
 */
@Component({
  selector: 'app-student-disability',
  templateUrl: './student-disability.component.html',
  styleUrls: ['./student-disability.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonTextarea, IonNote
  ]
})
export class StudentDisabilityComponent {
  // ── Input ────────────────────────────────────────────────
  dva     = input<boolean>(false);
  dsa     = input<boolean>(false);
  bes     = input<boolean>(false);
  adhd    = input<boolean>(false);
  noteDisabilita = input<string>('');
  pdpList = input<DocumentModel[]>([]);

  // ── Output ───────────────────────────────────────────────
  dataChanged = output<DisabilityData>();

  // ── State locale (copia modificabile) ───────────────────
  localDVA  = signal(false);
  localDSA  = signal(false);
  localBES  = signal(false);
  localADHD = signal(false);
  localNote = signal('');
  localPdp  = signal<DocumentModel[]>([]);

  constructor(private toaster: ToasterService) {
    addIcons({
      'accessibility-outline': accessibilityOutline,
      'document-text-outline': documentTextOutline,
      'link-outline': linkOutline,
      'add': add,
      'trash': trash,
      'open-outline': openOutline,
      'copy-outline': copyOutline
    });

    // Sincronizza lo stato locale quando cambiano gli input (sostituisce ngOnChanges per i signal inputs)
    effect(() => {
      this.localDVA.set(this.dva());
      this.localDSA.set(this.dsa());
      this.localBES.set(this.bes());
      this.localADHD.set(this.adhd());
      this.localNote.set(this.noteDisabilita());
      this.localPdp.set((this.pdpList() || []).map(d => new DocumentModel({ ...d })));
    }, { allowSignalWrites: true });
  }


  // ── Chip toggle ─────────────────────────────────────────
  toggle(field: 'DVA' | 'DSA' | 'BES' | 'ADHD') {
    if (field === 'DVA')  this.localDVA.update(v => !v);
    if (field === 'DSA')  this.localDSA.update(v => !v);
    if (field === 'BES')  this.localBES.update(v => !v);
    if (field === 'ADHD') this.localADHD.update(v => !v);
    this.emit();
  }

  onNoteChange(value: string) {
    this.localNote.set(value);
    this.emit();
  }

  // ── Gestione PDP ────────────────────────────────────────
  addPdp() {
    this.localPdp.update(list => [...list, new DocumentModel()]);
    this.emit();
  }

  removePdp(index: number) {
    this.localPdp.update(list => list.filter((_, i) => i !== index));
    this.emit();
  }

  onPdpChange() {
    this.emit();
  }

  openLink(url: string) {
    if (url) window.open(url, '_blank');
  }

  copyLink(url: string) {
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => this.toaster.presentToast({ message: 'Link copiato', duration: 1500, position: 'bottom' }))
      .catch(() => this.toaster.presentToast({ message: 'Impossibile copiare', duration: 1500, position: 'bottom' }));
  }

  // ── Emissione verso il genitore ─────────────────────────
  private emit() {
    this.dataChanged.emit({
      DVA:  this.localDVA(),
      DSA:  this.localDSA(),
      BES:  this.localBES(),
      ADHD: this.localADHD(),
      noteDisabilita: this.localNote(),
      pdpUrl: this.localPdp()
    });
  }
}
