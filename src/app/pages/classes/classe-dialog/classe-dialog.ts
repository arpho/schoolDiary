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
  IonTextarea,
  IonBackButton,
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonLabel
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
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ListStudent4classComponent } from '../components/list-student4class/list-student4class.component';
import { Evaluation } from 'src/app/shared/models/evaluation';
import { ReservedNotes4ClassesComponent } from '../components/reserved-notes4classes/reserved-notes4classes.component';
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
    IonBackButton,
    IonTabs,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonLabel,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ListStudent4classComponent,
    ReservedNotes4ClassesComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClasseDialogPage  implements OnInit {
  classKey = signal<string>('');
  classe = signal<ClasseModel>(new ClasseModel({}));
  formClass = new FormGroup({
    classe: new FormControl('', Validators.required),
    year: new FormControl('', Validators.required),
    descrizione: new FormControl('', Validators.required),
    note: new FormControl('', Validators.required),
  });
  isEditMode: boolean = false;
  selectedTab: string = 'generalita';

  constructor(
    private modalCtrl: ModalController,
    private service: ClassiService,
    private route: ActivatedRoute,
    private toaster: ToasterService
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
    const classKey = this.route.snapshot.paramMap.get('classeKey');
    if (classKey) {
      this.classKey.set(classKey);
      if (this.classKey()) {
        this.isEditMode = true;
        const editingClasse = await this.service.fetchClasse(this.classKey()!);
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

  async save() {
    // Crea una nuova istanza con i valori della form
    const classeObj = new ClasseModel(this.formClass.value).setKey(this.classKey()!);
    console.log("saving classeObj", classeObj);
    try {
      await this.service.updateClasse(this.classKey()!, classeObj);
      this.toaster.presentToast({message:"Classe aggiornata con successo",duration:2000,position:"bottom"});

    } catch (error) {
      this.toaster.presentToast({message:"Errore durante l'aggiornamento della classe",duration:2000,position:"bottom"});
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
