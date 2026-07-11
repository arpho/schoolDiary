import { Component, OnInit, inject, signal, computed, effect, Input, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required } from '@angular/forms/signals';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonItem, IonSelect, IonSelectOption, IonInput, IonList, ModalController, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { TimetableModel } from '../../models/timetable.model';
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

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
    FormField,
    FormRoot
]
})
export class TimeslotDialogComponent implements OnInit {
  @Input() item?: TimetableModel;

  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private modalController = inject(ModalController);

  // Form State
  slotModel = signal({
    slotType: 'lezione' as 'lezione' | 'ora_buca' | 'intervallo' | 'ricevimento',
    day: '',
    startTime: '',
    endTime: '',
    classKey: '',
    subjectKey: '',
    location: ''
  });

  slotForm = form(this.slotModel, schema((s) => {
    required(s.slotType);
    required(s.day);
    required(s.startTime);
    required(s.endTime);
  }));

  // Async Data State
  assignedClasses = signal<AssignedClass[]>([]); 
  subjectsMap = signal<Map<string, SubjectModel>>(new Map());

  // Computed list of subjects based on the selected class
  availableSubjects = computed(() => {
    const selectedClass = this.slotModel().classKey;
    if (!selectedClass) return [];
    
    const cls = this.assignedClasses().find(c => c.key === selectedClass);
    if (!cls || !cls.subjectsKey) return [];
    
    const map = this.subjectsMap();
    return cls.subjectsKey.map(key => map.get(key)).filter((s): s is SubjectModel => s !== undefined);
  });

  isFormValid = computed(() => {
    if (!this.slotForm().valid()) return false;
    if (this.slotModel().slotType === 'lezione') {
      if (!this.slotModel().classKey || !this.slotModel().subjectKey) return false;
    }
    return true;
  });

  constructor() {
    addIcons({ close });

    // Effect to reset classKey and subjectKey when type changes
    effect(() => {
      const type = this.slotModel().slotType;
      if (type !== 'lezione') {
        this.slotForm().patchValue({
          classKey: '',
          subjectKey: ''
        });
      }
    }, { allowSignalWrites: true });

    // Effect to reset subject when class changes
    effect(() => {
      const classKey = this.slotModel().classKey;
      if (classKey) {
        this.slotForm().patchValue({ subjectKey: '' });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.fetchUserClasses();
    if (this.item) {
      let type: 'lezione' | 'ora_buca' | 'intervallo' | 'ricevimento' = 'lezione';
      if (this.item.description === 'Ora Buca') {
        type = 'ora_buca';
      } else if (this.item.description === 'Intervallo') {
        type = 'intervallo';
      } else if (this.item.description === 'Ricevimento') {
        type = 'ricevimento';
      }

      this.slotForm().patchValue({
        slotType: type,
        day: this.item.day || '',
        startTime: this.item.startTime || '',
        endTime: this.item.endTime || '',
        classKey: this.item.classKey || '',
        subjectKey: this.item.subjectKey || '',
        location: this.item.location || ''
      });
    }
  }

  private async fetchUserClasses() {
    const user = await this.usersService.getLoggedUser();
    if (user && user.assignedClasses) {
      this.assignedClasses.set(user.assignedClasses);
      
      // Fetch all subjects for all assigned classes
      const allSubjectKeys = new Set<string>();
      user.assignedClasses.forEach(c => {
        if (c.subjectsKey) {
          c.subjectsKey.forEach(key => allSubjectKeys.add(key));
        }
      });
      
      const keysArray = Array.from(allSubjectKeys);
      if (keysArray.length > 0) {
        const subjects = await this.subjectService.fetchSubjectsByKeys(keysArray);
        const map = new Map<string, SubjectModel>();
        subjects.forEach(s => map.set(s.key, s));
        this.subjectsMap.set(map);
      }
    }
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (!this.isFormValid()) return;
    
    const val = this.slotModel();

    const newSlot = new TimetableModel({
      day: val.day,
      startTime: val.startTime,
      endTime: val.endTime,
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
    }

    this.modalController.dismiss(newSlot, 'confirm');
  }

  deleteSlot() {
    this.modalController.dismiss(this.item, 'delete');
  }
}
