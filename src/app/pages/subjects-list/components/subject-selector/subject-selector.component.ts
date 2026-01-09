import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButtons,
  IonButton,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  IonListHeader,
  IonSearchbar,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, close } from 'ionicons/icons';
import { SubjectModel } from '../../models/subjectModel';
import { SubjectService } from '../../services/subjects/subject.service';

/**
 * Componente per la selezione multipla di materie.
 * Visualizza una lista filtrabile di materie e permette di selezionarle.
 */
@Component({
  selector: 'app-subject-selector',
  templateUrl: './subject-selector.component.html',
  styleUrls: ['./subject-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonButtons,
    IonButton,
    IonIcon,
    IonRadioGroup,
    IonRadio,
    IonListHeader,
    IonSearchbar
  ]
})
export class SubjectSelectorComponent implements OnInit {
  @Input() selectedSubjectsKey: string[] = [];
  @Input() currentRole: 'coordinator' | 'secretary' | '' = '';

  subjects = signal<SubjectModel[]>([]);
  localSelectedKeys = signal<string[]>([]);
  localSelectedRole = signal<'coordinator' | 'secretary' | ''>('');
  searchTerm = signal('');

  filteredSubjects = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.subjects();
    return this.subjects().filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.classeDiConcorso.toLowerCase().includes(term)
    );
  });

  private $subjects = inject(SubjectService);
  private $modal = inject(ModalController);

  constructor() {
    addIcons({ checkmark, close });
  }

  ngOnInit() {
    this.localSelectedKeys.set([...this.selectedSubjectsKey]);
    this.localSelectedRole.set(this.currentRole);
    this.$subjects.fetchSubjectListOnRealTime((subjects) => {
      this.subjects.set(subjects.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }

  isSubjectSelected(key: string) {
    return this.localSelectedKeys().includes(key);
  }

  toggleSubject(key: string, event: any) {
    const checked = event.detail.checked;
    const current = this.localSelectedKeys();
    if (checked) {
      if (!current.includes(key)) {
        this.localSelectedKeys.set([...current, key]);
      }
    } else {
      this.localSelectedKeys.set(current.filter(k => k !== key));
    }
  }

  cancel() {
    this.$modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.$modal.dismiss({
      subjectsKey: this.localSelectedKeys(),
      role: this.localSelectedRole()
    }, 'confirm');
  }
}
