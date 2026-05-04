import { ViewChildren, QueryList } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsService } from '../../services/groups/groups.service';
import { GroupModel } from '../../models/groupModel';
import { IonButton, IonIcon, AlertController, IonSearchbar, IonSelect, IonSelectOption, IonItem, IonLabel, ModalController } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { medkit, cogOutline } from 'ionicons/icons';
import { ClassiService } from '../../services/classi.service';
import { ClasseModel } from '../../models/classModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from '../../../../shared/services/toaster.service';
import { GroupEditModalComponent } from './group-edit-modal/group-edit-modal.component';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';


import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
/**
 * Componente per la gestione dei gruppi di studenti in una classe.
 * Permette di creare gruppi e trascinare studenti (Drag & Drop) per assegnarli.
 */
@Component({
  selector: 'app-groups-manager',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    CdkDrag,
    CdkDropList,
    IonSearchbar,
    IonItem,
    IonLabel,
    GroupEditModalComponent,
    IonSelect,
    IonSelectOption
  ],
  templateUrl: './groups-manager.component.html',
  styleUrls: ['./groups-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsManagerComponent implements OnInit {

  highlightstudent(student: UserModel) {
    return {
      'highlight': this.searchTerm() && this.makeName(student).toLowerCase().includes(this.searchTerm().toLowerCase())
    }
  }
  searchTerm = signal<string>("")
  onSearchInput($event: Event) {
    this.searchTerm.set(($event.target as HTMLInputElement).value);
  }
  /**
   * Apre un dialog per modificare nome e descrizione di un gruppo.
   * @param group Il gruppo da modificare.
   */
  async editGroup(group: GroupModel) {
    const modal = await this.modalController.create({
      component: GroupEditModalComponent,
      componentProps: {
        group: group,
        subjects: this.subjects()
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    const result = data as any;

    if (role === 'confirm' && result) {
      group.nome = result.nome;
      group.description = result.description;
      group.subjectKey = result.subjectKey;
      group.note = result.note;

      try {
        await this.service.updateGroup(group);
        this.toast.showToast({ message: "Gruppo modificato con successo", duration: 2000, position: "bottom" });
      } catch (error) {
        this.toast.showToast({ message: "Errore durante la modifica del gruppo", duration: 2000, position: "bottom" });
        console.error("Errore durante la modifica del gruppo", error);
      }
    }
  }

  async openSettings(event: Event, group: GroupModel) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: GroupEditModalComponent,
      componentProps: {
        group: group,
        subjects: this.subjects(),
        showOnlySettings: true
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    const result = data as any;

    if (role === 'confirm' && result) {
      group.nome = result.nome;
      group.subjectKey = result.subjectKey;
      group.note = result.note;

      try {
        await this.service.updateGroup(group);
        this.toast.showToast({ message: "Impostazioni gruppo aggiornate", duration: 2000, position: "bottom" });
      } catch (error) {
        this.toast.showToast({ message: "Errore durante l'aggiornamento", duration: 2000, position: "bottom" });
        console.error("Errore durante l'aggiornamento del gruppo", error);
      }
    }
  }
  groupidfactory(group: GroupModel) {
    return `group-${group.key}`;
  }
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;

  private service = inject(GroupsService);
  private classi = inject(ClassiService);
  alertController = inject(AlertController);
  modalController = inject(ModalController);
  classkey = input<string>();
  groupsList = signal<GroupModel[]>([]);
  filterSubjectKey = signal<string>('all');
  filteredGroupsList = computed(() => {
    const filter = this.filterSubjectKey();
    if (filter === 'all') return this.groupsList();
    return this.groupsList().filter(group => group.subjectKey === filter);
  });
  subjects = signal<SubjectModel[]>([]);
  toast = inject(ToasterService);
  $users = inject(UsersService);
  filterStudents = signal<(user: UserModel) => boolean>((user: UserModel) => true);

  connectedLists: any;
  /**
   * Apre un dialog per creare un nuovo gruppo.
   */
  async addGroup() {
    const modal = await this.modalController.create({
      component: GroupEditModalComponent,
      componentProps: {
        subjects: this.subjects()
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    const result = data as any;

    if (role === 'confirm' && result) {
      const group = new GroupModel({ ...result, classKey: this.classkey() });
      try {
        const groupKey = await this.service.createGroup(group);
        group.setKey(groupKey);
        this.toast.showToast({ message: "Gruppo aggiunto con successo", duration: 2000, position: "bottom" });
      } catch (error) {
        this.toast.showToast({ message: "Errore durante l'aggiunta del gruppo", duration: 2000, position: "bottom" });
        console.error("Errore durante la creazione del gruppo", error);
      }
    }
  }
  classe = signal<ClasseModel | null>(null);
  availableStudents = signal<UserModel[]>([]);
  private unsubscribeFn: (() => void) | null = null;



  constructor() {
    addIcons({ medkit, cogOutline });
    this.connectedLists = computed(() => {
      return ["studentslist", ...this.filteredGroupsList().map(group => `group-${group.key}`)];
    });
    // Effetto reattivo che si attiva quando classkey cambia
    effect(async () => {
      const key = this.classkey();
      if (key) {
        const classe = await this.classi.fetchClasse(key);
        this.classe.set(classe);
        this.loadGroups4class(key);
        this.filterStudents.set((user: UserModel) => {
          const studentsKeyInGroups = this.groupsList().map(group => group.studentsKeyList).reduce((a, b) => a.concat(b), []);
          return !studentsKeyInGroups.includes(user.key);
        });
        try {
          this.$users.getUsersByClass(key, (users: UserModel[]) => {
            this.availableStudents.set(users.sort((a, b) => this.makeName(a).localeCompare(this.makeName(b))));
          });
          
          const loggedUser = await this.$users.getLoggedUser();
          if (loggedUser) {
            const subjects = await this.$users.getSubjectsByTeacherAndClass(loggedUser.key, key);
            this.subjects.set(subjects);
          }
        } catch (error) {
          console.error("Errore durante il recupero dei dati della classe", error);
        }
      }
    });
    effect(() => {
      this.groupsList().forEach(group => {
      });
    });
  }
  makeName(user: UserModel) {
    return `${user.lastName} ${user.firstName}`;
  }

  getSubjectName(subjectKey?: string) {
    if (!subjectKey) return '';
    const subject = this.subjects().find(s => s.key === subjectKey);
    return subject ? subject.name : '';
  }

  async ngOnInit() {
    // Initialize with all students as available
    this.availableStudents.set([...this.availableStudents().sort((a, b) => this.makeName(a).localeCompare(this.makeName(b)))]);
  }
  getDropList(groupKey: string): CdkDropList | undefined {
    return this.dropLists.find(dl => dl.id === `group-${groupKey}`);
  }

  /**
   * Gestisce l'evento di rilascio (drop) di uno studente.
   * Aggiorna i gruppi di origine e destinazione chiamando il servizio.
   */
  drop(event: CdkDragDrop<UserModel[]>, groupKey: string) {
    console.log("drop", event);
    console.log("inserire studente", event.item.data, " in gruppo", groupKey)
    const previouscontainerId = event.previousContainer.id.split("-")[1];
    console.log("previouscontainerId", previouscontainerId)
    const destinationcontainerId = event.container.id.split("-")[1];

    const destinationGroup = this.filteredGroupsList().find(group => group.key === destinationcontainerId);
    console.log("destinationGroup", destinationGroup)

    const originGroup = this.filteredGroupsList().find(group => group.key === previouscontainerId);
    console.log("originGroup", originGroup)
    console.log("destinationGroup", destinationGroup);
    if (originGroup && destinationGroup && event.previousContainer === event.container) {// se lo studente viene spostato all'interno dello stesso gruppo
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    else if (originGroup && destinationGroup && event.previousContainer !== event.container) {// se lo studente viene spostato da un gruppo ad un altro
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    if (!originGroup && destinationGroup) {// studente inserito in un gruppo dalla lista degli studenti disponibili 
      destinationGroup.studentsList.splice(event.currentIndex, 0, event.item.data);

    }
    if (originGroup && !destinationGroup) {// studente rimosso da un gruppo
      originGroup.studentsList.splice(event.previousIndex, 1);
    }




    try {
      if (originGroup && destinationGroup) {
        this.service.UpdateOriginAndDestinationGroups(originGroup, destinationGroup)
        this.toast.showToast({ message: `Studente ${event.item.data.lastName} ${event.item.data.firstName} aggiunto con successo al gruppo ${destinationGroup.nome}`, duration: 2000, position: "top" });
      }
      else if (originGroup && !destinationGroup) {
        this.service.updateGroup(originGroup).then(() => {
          this.toast.showToast({ message: "Studente rimosso con successo dal gruppo", duration: 2000, position: "top" });
          console.log("studente rimosso", originGroup, originGroup.serialize());
        })
      }
      if (!originGroup && destinationGroup) {
        this.service.updateGroup(destinationGroup).then(() => {
          this.toast.showToast({ message: "Studente aggiunto con successo al gruppo", duration: 2000, position: "top" });
          console.log("studente aggiunto", destinationGroup, destinationGroup.serialize());
        })
      }
    }
    catch (error) {
      console.log("errore durante l'aggiornamento del gruppo", error)
      this.toast.showToast({ message: "Errore durante l'aggiornamento del gruppo", duration: 2000, position: "top" });
      console.error("Errore durante l'aggiornamento del gruppo", error);
    }

  }

  private loadGroups4class(classKey: string) {
    this.service.fetchGroups4class(classKey, (groups) => {

      // Sort groups by name before setting them
      const sortedGroups = [...groups].sort((a, b) =>
        a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' })
      );
      this.groupsList.set(sortedGroups);
    });


    if (!classKey) {
      console.warn('Nessun classKey fornito');

    }


  }

  ngOnDestroy() {
    // Pulisci la sottoscrizione quando il componente viene distrutto
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }
  }
}
