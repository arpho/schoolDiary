import {
  Component,
  Input,
  inject
} from '@angular/core';
import {
  ModalController,
  IonButton,
  IonInput,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {
  CommonModule
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  ClassiService,
} from '../services/classi.service';
import { ClasseModel } from '../models/classModel';

@Component({
  selector: 'app-classe-dialog',
  templateUrl: './classe-dialog.html',
  styleUrls: ['./classe-dialog.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class ClasseDialogPage {
  @Input() classe: ClasseModel = new ClasseModel();
  @Input() classeId: string | null = null;

  private modalCtrl = inject(ModalController);
  private classiService = inject(ClassiService);
  constructor(

  ) {
    
  }

  save() {
    // Crea una nuova istanza con i valori della form
    const classeObj = new ClasseModel({ ...this.classe });
    if (this.classeId) {
      classeObj.key = this.classeId;
    }
    this.modalCtrl.dismiss(classeObj);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
