import { Component, EventEmitter, inject, Input, OnInit, Output, signal, effect, OnChanges } from '@angular/core';
import { ClasseModel } from '../../models/classModel';
import { AssignedClass } from '../../../subjects-list/models/assignedClass';
import { SubjectModel } from '../../../subjects-list/models/subjectModel';
import { SubjectService } from '../../../subjects-list/services/subjects/subject.service';
import { IonCardContent, IonCardHeader, IonCardTitle, IonCard, IonBadge, IonButton, IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { settingsOutline, schoolOutline, recording } from 'ionicons/icons';

/**
 * Componente per la visualizzazione di una scheda "classe".
 * Mostra il nome della classe e le icone per le materie associate.
 */
@Component({
  selector: 'app-class-viewer',
  templateUrl: './class-viewer.component.html',
  styleUrls: ['./class-viewer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonBadge,
    IonButton,
    IonIcon
  ],
})
export class ClassViewerComponent implements OnInit, OnChanges {
  @Input() classe: ClasseModel | AssignedClass = new ClasseModel();
  @Input() editable: boolean = false;
  @Output() onEdit = new EventEmitter<void>();

  resolvedSubjects = signal<SubjectModel[]>([]);
  allSubjects = signal<SubjectModel[]>([]);

  private $subjects = inject(SubjectService);

  constructor() {
    addIcons({ settingsOutline, schoolOutline, recording });
  }

  ngOnInit() {
    this.$subjects.fetchSubjectListOnRealTime((subjects) => {
      this.allSubjects.set(subjects);
      this.resolveSubjects();
    });
  }

  ngOnChanges() {
    this.resolveSubjects();
  }

  /**
   * Risolve le chiavi delle materie nei dettagli completi delle materie.
   * Gestisce sia oggetti `AssignedClass` che oggetti generici con `subjectsKey`.
   */
  private resolveSubjects() {
    if (this.classe instanceof AssignedClass) {
      const subjects = (this.classe.subjectsKey || [])
        .map(key => this.allSubjects().find(s => s.key === key))
        .filter((s): s is SubjectModel => !!s);
      this.resolvedSubjects.set(subjects);
    } else if (this.classe && 'subjectsKey' in this.classe && Array.isArray((this.classe as any).subjectsKey)) {
      const subjects = (this.classe as any).subjectsKey
        .map((key: string) => this.allSubjects().find(s => s.key === key))
        .filter((s: any): s is SubjectModel => !!s);
      this.resolvedSubjects.set(subjects);
    } else {
      this.resolvedSubjects.set([]);
    }
  }

  isCoordinator() {
    return (this.classe as any).coordinator === 'true' || (this.classe as any).coordinator === true;
  }

  isSecretary() {
    return (this.classe as any).secretary === 'true' || (this.classe as any).secretary === true;
  }

  /**
   * Emette l'evento di modifica quando l'utente clicca sul pulsante edit.
   */
  edit() {
    this.onEdit.emit();
  }
}
