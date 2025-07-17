import {
  Component,
  OnInit,
  signal,
  input,
  computed,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {
  ModalController,
  IonButton,
  IonInput,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonTextarea
} from '@ionic/angular/standalone';
import {
  CommonModule
} from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ClassiService,
} from '../services/classi.service';
import { ClasseModel } from '../models/classModel';
import { ActivatedRoute } from '@angular/router';

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
    IonTextarea,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClasseDialogPage  implements OnInit {

  classeId = signal<string>('');
  classe = signal<ClasseModel>(new ClasseModel({}));
  formClass = new FormGroup({
    classe: new FormControl('', Validators.required),
    year: new FormControl('', Validators.required),
    descrizione: new FormControl('', Validators.required),
    note: new FormControl('', Validators.required),
  });

  constructor(
    private modalCtrl: ModalController,
    private service: ClassiService,
    private route: ActivatedRoute
  ) {
    // Initialize with empty model
    this.classe.set(new ClasseModel({
      year: '',
      classe: '',
      descrizione: '',
      note: ''
    }));
  }
  async ngOnInit(): Promise<void> {
    const classeKey = this.route.snapshot.paramMap.get('classeKey');
    if (classeKey) {
      this.classeId.set(classeKey);
      if (this.classeId()) {
        const editingClasse = await this.service.fetchClasse(this.classeId()!);
        this.classe.set(editingClasse);
        this.formClass.setValue({
          classe: editingClasse.classe,
          year: editingClasse.year,
          descrizione: editingClasse.descrizione,
          note: editingClasse.note
        });
        console.log("editingClasse", this.classe());
        // Ensure the model is properly initialized
        this.classe.set(new ClasseModel({
          year: editingClasse.year,
          classe: editingClasse.classe,
          descrizione: editingClasse.descrizione,
          note: editingClasse.note
        }));
      }
    }
  }

  save() {
    // Crea una nuova istanza con i valori della form
    const classeObj = new ClasseModel(this.formClass.value).setKey(this.classeId()!);
    console.log("classeObj", classeObj);
    
    if (this.classeId()) {
      classeObj.setKey(this.classeId()!);
    }
    this.modalCtrl.dismiss(classeObj);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
