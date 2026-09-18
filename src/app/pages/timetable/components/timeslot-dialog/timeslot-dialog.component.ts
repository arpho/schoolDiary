import { Component, OnInit, inject, signal, computed, effect, Input, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required } from '@angular/forms/signals';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonSelect, IonSelectOption, IonInput, IonList, ModalController, IonFooter, IonGrid, IonRow, IonCol, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { TimetableModel } from '../../models/timetable.model';
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { SchoolTimeSlot } from 'src/app/shared/models/userModel';

@Component({
  selector: 'app-timeslot-dialog',
  templateUrl: './timeslot-dialog.component.html',
  styleUrls: ['./timeslot-dialog.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonList,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    FormField,
    FormRoot
]
})
export class TimeslotDialogComponent implements OnInit {
  @Input() item?: TimetableModel;

  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);
  private classiService = inject(ClassiService);

  // Form State
  slotModel = signal({
    slotType: 'lezione' as 'lezione' | 'ora_buca' | 'intervallo' | 'ricevimento' | 'a_disposizione',
    day: '',
    slotNames: [] as string[],
    classKey: '',
    subjectKey: '',
    location: ''
  });

  slotForm = form(this.slotModel, schema((s) => {
    required(s.slotType);
    required(s.day);
  }));

  // Async Data State
  activeClasses = signal<ClasseModel[]>([]); 
  classSubjects = signal<SubjectModel[]>([]);
  schoolTimeSlots = signal<SchoolTimeSlot[]>([]);

  isFormValid = computed(() => {
    if (!this.slotForm().valid()) return false;
    if (this.slotModel().slotNames.length === 0) return false;
    if (this.slotModel().slotType === 'lezione') {
      if (!this.slotModel().classKey || !this.slotModel().subjectKey) return false;
    }
    return true;
  });

  constructor() {
    addIcons({ close });

    // Effect to reset classKey and subjectKey when type changes
    effect(() => {
      const model = this.slotModel();
      const type = model.slotType;
      
      if (type !== 'lezione') {
        if (model.classKey !== '' || model.subjectKey !== '') {
          this.slotForm().value.update(v => ({...v,
            classKey: '',
            subjectKey: ''
          }));
        }
      }
    });

    let previousClassKey = '';
    // Effect to reset subject when class changes and fetch subjects
    effect(() => {
      const model = this.slotModel();
      const classKey = model.classKey;
      
      if (classKey && classKey !== previousClassKey) {
        if (previousClassKey !== '') {
          // Only clear if the user changed the class (not on initial load/edit)
          if (model.subjectKey !== '') {
            this.slotForm().value.update(v => ({...v, subjectKey: '' }));
          }
        }
        previousClassKey = classKey;
        
        // Fetch subjects for this class
        this.usersService.getSubjectsForClass(classKey).then(subjects => {
           this.classSubjects.set(subjects);
        });
      } else if (!classKey) {
        previousClassKey = '';
        this.classSubjects.set([]);
      }
    });
  }

  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (!user?.schoolTimeSlots || user.schoolTimeSlots.length === 0) {
      const alert = await this.alertController.create({
        header: 'Configurazione Mancante',
        message: 'Per inserire l\'orario devi prima definire la Scansione Oraria nelle Impostazioni.',
        buttons: ['Vai alle Impostazioni']
      });
      await alert.present();
      this.modalController.dismiss();
      return;
    }
    this.schoolTimeSlots.set(user.schoolTimeSlots);

    this.fetchUserClasses();
    if (this.item) {
      let type: 'lezione' | 'ora_buca' | 'intervallo' | 'ricevimento' | 'a_disposizione' = 'lezione';
      if (this.item.description === 'Ora Buca') {
        type = 'ora_buca';
      } else if (this.item.description === 'Intervallo') {
        type = 'intervallo';
      } else if (this.item.description === 'Ricevimento') {
        type = 'ricevimento';
      } else if (this.item.description === 'A Disposizione') {
        type = 'a_disposizione';
      }

      this.slotForm().value.update(v => ({...v,
        slotType: type,
        day: this.item?.day || '',
        slotNames: this.item?.slotNames || [],
        classKey: this.item?.classKey || '',
        subjectKey: this.item?.subjectKey || '',
        location: this.item?.location || ''
      }));
    }
  }

  private async fetchUserClasses() {
    this.classiService.getClassiOnRealtime(false).subscribe(classes => {
      this.activeClasses.set(classes);
    });
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (!this.isFormValid()) return;
    
    const val = this.slotModel();

    // Calcoliamo lo startTime e endTime effettivo basandoci sugli slot
    const slots = this.schoolTimeSlots();
    const selectedSlots = val.slotNames.map(sn => slots.find(s => s.name === sn)).filter(s => !!s) as SchoolTimeSlot[];
    
    let computedStartTime = '';
    let computedEndTime = '';

    if (selectedSlots.length > 0) {
      // Ordina gli slot per ora di inizio in modo da prendere il minimo e il massimo
      selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      computedStartTime = selectedSlots[0].startTime;
      computedEndTime = selectedSlots[selectedSlots.length - 1].endTime;
    }

    const newSlot = new TimetableModel({
      day: val.day,
      startTime: computedStartTime,
      endTime: computedEndTime,
      slotNames: val.slotNames,
      location: val.location,
      description: '',
      classKey: val.slotType === 'lezione' ? val.classKey : '',
      subjectKey: val.slotType === 'lezione' ? val.subjectKey : '',
      type: val.slotType
    });

    if (val.slotType === 'ora_buca') {
      newSlot.description = 'Ora Buca';
    } else if (val.slotType === 'intervallo') {
      newSlot.description = 'Intervallo';
    } else if (val.slotType === 'ricevimento') {
      newSlot.description = 'Ricevimento';
    } else if (val.slotType === 'a_disposizione') {
      newSlot.description = 'A Disposizione';
    }

    this.modalController.dismiss(newSlot, 'confirm');
  }

  deleteSlot() {
    this.modalController.dismiss(this.item, 'delete');
  }
}
