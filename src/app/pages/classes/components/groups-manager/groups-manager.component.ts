import { ViewChildren, QueryList } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsService } from '../../services/groups/groups.service';
import { GroupModel } from '../../models/groupModel';
import { IonButton, IonIcon, AlertController, IonSearchbar } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { medkit } from 'ionicons/icons';
import { ClassiService } from '../../services/classi.service';
import { ClasseModel } from '../../models/classModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from '../../../../shared/services/toaster.service';


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
    IonSearchbar
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

    const alert = await this.alertController.create({
      header: 'Edit Group',
      message: `Modifica il gruppo ${group.nome}`,
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome del gruppo',
          value: group.nome
        },
        { name: 'description', type: 'text', placeholder: 'descrizione', value: group.description }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'salva',
          handler: (data: { nome: string, description: string }) => {

            group.nome = data.nome;
            group.description = data.description;

            try {
              this.service.updateGroup(group).then(() => {
                this.toast.showToast({ message: "Gruppo modificato con successo", duration: 2000, position: "bottom" });

              }).catch((error) => {
                this.toast.showToast({ message: "Errore durante la modifica del gruppo", duration: 2000, position: "bottom" });

              });
            }




            catch (error) {
              console.error("Errore durante la modifica del gruppo", error);
            }
          }
        }
      ]
    });
    await alert.present();
  }
  groupidfactory(group: GroupModel) {
    return `group-${group.key}`;
  }
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;

  private service = inject(GroupsService);
  private classi = inject(ClassiService);
  alertController = inject(AlertController);
  classkey = input<string>();
  groupsList = signal<GroupModel[]>([]);
  toast = inject(ToasterService);
  $users = inject(UsersService);
  filterStudents = signal<(user: UserModel) => boolean>((user: UserModel) => true);

  connectedLists: any;
  /**
   * Apre un dialog per creare un nuovo gruppo.
   */
  async addGroup() {
    console.log("addGroup")
    const alert = await this.alertController.create({
      header: 'Crea Gruppo',
      message: 'Inserisci il nome del gruppo',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome del gruppo',
          value: `gruppo ${this.groupsList().length + 1}`
        },
        { name: 'description', type: 'text', placeholder: 'description', value: '' }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Create',
          handler: (data: { nome: string, description: string }) => {
            console.log('Creating group', data);
            const group = new GroupModel({ ...data, classKey: this.classkey() })
            console.log("group aggiunto", group)
            try {
              this.service.createGroup(group).then((groupKey: string) => {
                this.toast.showToast({ message: "Gruppo aggiunto con successo", duration: 2000, position: "bottom" });
                console.log("gruppo creato", group);
                group.setKey(groupKey);
              }).catch((error) => {
                this.toast.showToast({ message: "Errore durante l'aggiunta del gruppo", duration: 2000, position: "bottom" });
                console.log("errore durante l'aggiunta del gruppo", error);
              });
            }




            catch (error) {
              console.error("Errore durante la creazione del gruppo", error);
            }
          }
        }
      ]
    });
    await alert.present();
  }
  classe = signal<ClasseModel | null>(null);
  availableStudents = signal<UserModel[]>([]);
  private unsubscribeFn: (() => void) | null = null;



  constructor() {
    addIcons({ medkit });
    this.connectedLists = computed(() => {
      return ["studentslist", ...this.groupsList().map(group => `group-${group.key}`)];
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
        } catch (error) {
          console.error("Errore durante la recupero degli studenti", error);
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

    const destinationGroup = this.groupsList().find(group => group.key === destinationcontainerId);
    console.log("destinationGroup", destinationGroup)

    const originGroup = this.groupsList().find(group => group.key === previouscontainerId);
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
