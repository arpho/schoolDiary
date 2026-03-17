import { CommonModule } from '@angular/common';
import { Component, Input, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonNote,
  IonFab,
  IonFabButton,
  ModalController,
  IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, closeOutline, saveOutline, documentTextOutline, documentText, add, save } from 'ionicons/icons';
import { DocumentModel } from 'src/app/pages/classes/models/documentModel';

/**
 * Modale per la gestione dei documenti PDP di uno studente.
 * Permette di aggiungere, modificare e rimuovere link ai documenti PDP.
 * Restituisce la lista aggiornata tramite ModalController.dismiss().
 */
@Component({
  selector: 'app-pdp-dialog',
  templateUrl: './pdp-dialog.component.html',
  styleUrls: ['./pdp-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonNote,
    IonFab,
    IonFabButton,
    IonFooter
  ]
})
export class PdpDialogComponent implements OnInit {

  /** Lista iniziale dei documenti PDP passata come @Input dal componente chiamante */
  @Input() pdpList: DocumentModel[] = [];

  /** Copia locale modificabile */
  localPdpList = signal<DocumentModel[]>([]);
  pdp = model<DocumentModel>(new DocumentModel());
  constructor(private modalCtrl: ModalController) {
    addIcons({
      documentText,
      add,
      save,
      addOutline,
      trashOutline,
      closeOutline,
      saveOutline,
      documentTextOutline
    });
  }

  ngOnInit(): void {
    // Crea una deep copy per evitare mutazioni sull'originale
    this.localPdpList.set(
      this.pdpList.map(doc => new DocumentModel({ ...doc }))
    );
  }

  /** Aggiunge un documento PDP vuoto alla lista */
  addPdp(): void {
    this.localPdpList.update(list => [...list, new DocumentModel()]);
  }

  /** Rimuove il documento PDP all'indice specificato */
  removePdp(index: number): void {
    this.localPdpList.update(list => list.filter((_, i) => i !== index));
  }

  /** Aggiorna il campo 'name' di un documento PDP alla posizione index */
  updateName(index: number, value: string): void {
    this.localPdpList.update(list => {
      const updated = [...list];
      updated[index] = new DocumentModel({ ...updated[index], name: value });
      return updated;
    });
  }

  /** Aggiorna il campo 'path' (URL) di un documento PDP alla posizione index */
  updatePath(index: number, value: string): void {
    this.localPdpList.update(list => {
      const updated = [...list];
      updated[index] = new DocumentModel({ ...updated[index], path: value });
      return updated;
    });
  }

  /** Aggiorna il campo 'descrizione' di un documento PDP alla posizione index */
  updateDescrizione(index: number, value: string): void {
    this.localPdpList.update(list => {
      const updated = [...list];
      updated[index] = new DocumentModel({ ...updated[index], descrizione: value });
      return updated;
    });
  }

  /** Chiude il modale senza salvare */
  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  /** Chiude il modale restituendo la lista aggiornata */
  save(): void {
    this.modalCtrl.dismiss(this.localPdpList(), 'confirm');
  }
}
