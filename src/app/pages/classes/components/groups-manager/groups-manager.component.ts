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
import { ToasterService } from '../../../../shared/services/toaster.service';
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
  private service = inject(GroupsService); 
  private classi = inject(ClassiService);
  alertController = inject(AlertController);
  classkey = input<string>();
  groupsList = signal<GroupModel[]>([]);
  toast = inject(ToasterService);
  $users = inject(UsersService);
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
      handler: (data: { nome: string, description: string }) => {
        console.log('Creating group', data);
         const group = new GroupModel({...data,classKey:this.classkey()})
         console.log("group aggiunto",group)
         try{
           this.service.createGroup(group).then((groupKey:string) => {
            this.toast.showToast({message:"Gruppo aggiunto con successo",duration:2000,position:"bottom"});
            console.log("gruppo creato", group);
            group.setKey(groupKey);
          }).catch((error) => {
            this.toast.showToast({message:"Errore durante l'aggiunta del gruppo",duration:2000,position:"bottom"});
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
      if(key){
      const classe = await this.classi.fetchClasse(key);
      this.classe.set(classe);
      this.loadGroups4class(key);
      try {
        this.$users.getUsersByClass(key, (users: UserModel[]) => {
          this.availableStudents.set(users);
        });
      } catch (error) {
        console.error("Errore durante la recupero degli studenti", error);
      }
    }
    });
    effect(() => {
this.groupsList().forEach(group => {
  console.log(group);
}); 
    });
  }

  async ngOnInit() {
    // Initialize with all students as available
    this.availableStudents.set([...this.availableStudents()]);
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

  private loadGroups4class(classKey: string) {
    this.service.fetchGroups4class(classKey, (groups) => {
      console.log("groups 4 class ",classKey, groups);
      this.groupsList.set(groups);
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
