import { Component, OnInit, inject, signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonItem, IonSelect, IonSelectOption, IonInput, IonList, IonFooter
  ]
})
export class TimeslotDialogComponent implements OnInit {
  @Input() item?: TimetableModel;

  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private modalController = inject(ModalController);

  // Form State
  slotType = signal<'lezione' | 'ora_buca' | 'intervallo' | 'ricevimento'>('lezione');
  day = signal<string>('');
  startTime = signal<string>('');
  endTime = signal<string>('');
  classKey = signal<string>('');
  subjectKey = signal<string>('');
  location = signal<string>('');

  // Async Data State
  assignedClasses = signal<AssignedClass[]>([]); 
  subjectsMap = signal<Map<string, SubjectModel>>(new Map());

  // Computed list of subjects based on the selected class
  availableSubjects = computed(() => {
    const selectedClass = this.classKey();
    if (!selectedClass) return [];
    
    const cls = this.assignedClasses().find(c => c.key === selectedClass);
    if (!cls || !cls.subjectsKey) return [];
    
    const map = this.subjectsMap();
    return cls.subjectsKey.map(key => map.get(key)).filter((s): s is SubjectModel => s !== undefined);
  });

  isFormValid = computed(() => {
    if (!this.day() || !this.startTime() || !this.endTime()) return false;
    if (this.slotType() === 'lezione') {
      if (!this.classKey() || !this.subjectKey()) return false;
    }
    return true;
  });

  constructor() {
    addIcons({ close });
  }

  ngOnInit() {
    this.fetchUserClasses();
    if (this.item) {
      if (this.item.description === 'Ora Buca') {
        this.slotType.set('ora_buca');
      } else if (this.item.description === 'Intervallo') {
        this.slotType.set('intervallo');
      } else if (this.item.description === 'Ricevimento') {
        this.slotType.set('ricevimento');
      } else {
        this.slotType.set('lezione');
      }

      this.day.set(this.item.day || '');
      this.startTime.set(this.item.startTime || '');
      this.endTime.set(this.item.endTime || '');
      this.classKey.set(this.item.classKey || '');
      this.subjectKey.set(this.item.subjectKey || '');
      this.location.set(this.item.location || '');
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

    const newSlot = new TimetableModel({
      day: this.day(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      location: this.location(),
      description: '',
      classKey: this.slotType() === 'lezione' ? this.classKey() : '',
      subjectKey: this.slotType() === 'lezione' ? this.subjectKey() : '',
      type: this.slotType()
    });

    if (this.slotType() === 'ora_buca') {
      newSlot.description = 'Ora Buca';
    } else if (this.slotType() === 'intervallo') {
      newSlot.description = 'Intervallo';
    } else if (this.slotType() === 'ricevimento') {
      newSlot.description = 'Ricevimento';
    }

    this.modalController.dismiss(newSlot, 'confirm');
  }

  deleteSlot() {
    this.modalController.dismiss(this.item, 'delete');
  }
}
