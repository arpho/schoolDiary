import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsService } from '../../services/groups/groups.service';
import { GroupModel } from '../../models/groupModel';
import { IonButton, IonIcon,IonAlert,AlertController } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, medkit } from 'ionicons/icons';
import { ClassiService } from '../../services/classi.service';
import { ClasseModel } from '../../models/classModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-groups-manager',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    CdkDrag,
    CdkDropList,
    IonAlert
  ],
  templateUrl: './groups-manager.component.html',
  styleUrls: ['./groups-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsManagerComponent implements OnInit {
  alertController = inject(AlertController);
async addGroup() {
console.log("addGroup")
const alert = await this.alertController.create({
  header: 'Crea Gruppo',
  message: 'Inserisci il nome del gruppo',
  inputs: [
    {
      name: 'name',
      type: 'text',
      placeholder: 'Nome del gruppo',
      value: `gruppo ${this.groupslist().length + 1}`
    },
    {name: 'description',type: 'text',placeholder: 'description',value: ''}
  ],
  buttons: [
    {
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary'
    },
    {
      text: 'Create',
      handler: (data: { name: string, description: string }) => {
        console.log('Creating group', data);
         const group = new GroupModel({...data,classKey:this.classkey()})
         console.log("group",group)

        }
    }
  ]
});
await alert.present();
}
  // Usiamo input.required per assicurarci che il valore sia sempre fornito
  classkey = input.required<string>();
   students = signal<UserModel[]>([]);
   private $users = inject(UsersService);
  private service = inject(GroupsService);
  private classi= inject(ClassiService);
  groupslist = signal<GroupModel[]>([]);
  classe = signal<ClasseModel | null>(null);
  availableStudents = signal<UserModel[]>([]);
  private unsubscribeFn: (() => void) | null = null;

  rowData = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
];
    

  constructor() {
    addIcons({medkit});
    // Effetto reattivo che si attiva quando classkey cambia
    effect(async () => {
      const key = this.classkey();
      const classe = await this.classi.fetchClasse(key);
      this.classe.set(classe);
      this.loadGroups(key);
      try {
        this.$users.getUsersByClass(key, (users: UserModel[]) => {
          console.log("students ", users);
          this.availableStudents.set(users);
        });
      } catch (error) {
        console.error("Errore durante la recupero degli studenti", error);
      }
    });
    effect(() => {
this.groupslist().forEach(group => {
  console.log(group);
}); 
    });
  }

  async ngOnInit() {
    // Initialize with all students as available
    this.availableStudents.set([...this.students()]);
  }

  drop(event: CdkDragDrop<UserModel[]>) {
    console.log("drop", event);
    if (event.previousContainer === event.container) {
      console.log("moveItemInArray",event.previousContainer);
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  private loadGroups(classKey: string) {
    this.service.fetchGroups4class(classKey, (groups) => {
      this.groupslist.set(groups);
    });
    // Annulla la sottoscrizione precedente se esiste
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }

    if (!classKey) {
      console.warn('Nessun classKey fornito');

    }

    this.unsubscribeFn = this.service.fetchGroups4class(classKey, (groups) => {
      this.groupslist.set(groups);
    });
  }

  ngOnDestroy() {
    // Pulisci la sottoscrizione quando il componente viene distrutto
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }
  }
}
