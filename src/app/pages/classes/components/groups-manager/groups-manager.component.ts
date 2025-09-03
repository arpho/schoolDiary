import { ViewChildren, QueryList } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, effect, computed } from '@angular/core';
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
  filterStudents = signal<(user:UserModel) => boolean>((user:UserModel) => true);

connectedLists: any;
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

    

  constructor() {
    addIcons({medkit});
    this.connectedLists= computed(() => {
      return[ "studentslist",...this.groupsList().map(group => `group-${group.key}`)];
    });
    // Effetto reattivo che si attiva quando classkey cambia
    effect(async () => {
      const key = this.classkey();
      if(key){
      const classe = await this.classi.fetchClasse(key);
      this.classe.set(classe);
      this.loadGroups4class(key);
      this.filterStudents.set((user:UserModel) => {
        const studentsKeyInGroups = this.groupsList().map(group => group.studentsKeyList).reduce((a, b) => a.concat(b), []);
        return !studentsKeyInGroups.includes(user.key);
      });
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
  getDropList(groupKey: string): CdkDropList | undefined {
    return this.dropLists.find(dl => dl.id === `group-${groupKey}`);
  }

  drop(event: CdkDragDrop<UserModel[]>,groupKey:string) {
    console.log("drop", event);
    console.log("inserire studente", event.item.data," in gruppo",groupKey)
    const previouscontainerId = event.previousContainer.id.split("-")[1];
    console.log("previouscontainerId",previouscontainerId)
const originGroup = this.groupsList().find(group => group.key === previouscontainerId);
if(originGroup){
  console.log("rimuovere studente",event.item.data," da gruppo",originGroup)
  originGroup.studentsList = originGroup.studentsList.filter(student => student.key !== event.item.data.key);
  console.log("gruppo aggiornato",originGroup,originGroup.serialize())
}
const destinationGroup = this.groupsList().find(group => group.key === groupKey);

if (event.previousContainer === event.container) {
  console.log("moveItemInArray previous",event.previousContainer.id);
  console.log("moveItemInArray container",event.container.id);

    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
} else {
        transferArrayItem(
    event.previousContainer.data,
    event.container.data,
    event.previousIndex,
    event.currentIndex,
  );
}


try{ 
  if(originGroup && destinationGroup){
    this.service.UpdateOriginAndDestinationGroups(originGroup,destinationGroup)
    this.toast.showToast({message:`Studente ${event.item.data.lastName} ${event.item.data.firstName} aggiunto con successo al gruppo ${destinationGroup.nome}`,duration:2000,position:"top"});
  }
  else if(originGroup && !destinationGroup){
    this.service.updateGroup(originGroup).then(() => {
      this.toast.showToast({message:"Studente rimosso con successo dal gruppo",duration:2000,position:"top"});
      console.log("studente rimosso", originGroup,originGroup.serialize());
    })
  }
  if(!originGroup && destinationGroup){
    this.service.updateGroup(destinationGroup).then(() => {
      this.toast.showToast({message:"Studente aggiunto con successo al gruppo",duration:2000,position:"top"});
      console.log("studente aggiunto", destinationGroup,destinationGroup.serialize());
    })
  }    
 }
catch (error) {
  console.log("errore durante l'aggiornamento del gruppo", error)
  this.toast.showToast({message:"Errore durante l'aggiornamento del gruppo",duration:2000,position:"top"});
  console.error("Errore durante l'aggiornamento del gruppo", error);
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
