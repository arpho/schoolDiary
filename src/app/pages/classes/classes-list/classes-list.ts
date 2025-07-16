import {
  Component,
  computed,
  OnInit,
  signal,
  inject,
  effect
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  FormsModule
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonFab,
  IonFabButton,
  IonFabList,
  IonList } from '@ionic/angular/standalone';
import {
  ClassiService,
} from '../services/classi.service';
import { ModalController } from '@ionic/angular';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { ClasseDialogPage } from '../classe-dialog/classe-dialog';
import { Router } from '@angular/router';
import { ClasseModel } from '../models/classModel';
import { Subscription } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { addIcons } from 'ionicons';
import {
    add,
    create,
    trash,
    close,
    archive
} from 'ionicons/icons';

@Component({
  selector: 'app-classes-list',
  templateUrl: './classes-list.html',
  styleUrls: ['./classes-list.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonItem,
    IonFab,
    IonFabButton,
    IonList
]
})
export class ClassesListComponent {
  async clickedClass(arg0: ClasseModel) {
console.log("clickedClass", arg0);
const actionSheet = await this.actionSheetController.create({
  header: 'Select an option',
  buttons: [
    {
      text: 'Delete',
      role: 'destructive',
      icon: 'trash',
      handler: () => {
       this.deleteClass(arg0);
      },
    },
    {
      text: 'Edit',
      icon: 'create',
      handler: () => {
        this.editClass(arg0.key);
      },
    },
    {
      text: 'Archivia',
      icon: 'archive',
      handler: () => {
        this.archives(arg0.key);
      },
    },
    {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      },
    },
  ],
});
await actionSheet.present();
}
  archives(key: string) {
console.log("Archivia", key)
  }
  editClass(arg0: string) {
    this.go2ClasseDialog(arg0);
  }
  async deleteClass(arg0: ClasseModel) {
   const alert = await this.alertController.create({
    header: 'Delete',
    message: 'Are you sure you want to delete this class?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        },
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          this.service.deleteClasse(arg0.key).then(() => {
            this.toaster.presentToast({message:"Classe eliminata con successo",duration:2000,position:"bottom"});
          }).catch((error) => {
            this.toaster.presentToast({message:"Errore durante l'eliminazione della classe",duration:2000,position:"bottom"});
          })  .finally(() => {

          });
        },
      },
    ],
  });
  await alert.present();
  }
subscriptions = new Subscription()
  classiList = signal<ClasseModel[]>([]);
constructor(
  private modalController: ModalController,
  private router: Router,
  private service: ClassiService,
  private toaster: ToasterService,
  private actionSheetController: ActionSheetController,
  private alertController: AlertController
) {
  addIcons({
    add,
    trash,
    create,
    close,
    archive
});
}
  ngOnInit(): void {
    this.service.getClassiOnRealtime((classi) => {
      this.classiList.set(classi);
    });
  }

  showList = effect(() => {
    console.log(this.classiList());
    return this.classiList().length > 0;
  })

  async go2ClasseDialog(classeId: string) {
    let classe: ClasseModel | undefined = undefined;
    if (classeId) {
      classe = this.classiList().find(c => c.key === classeId);
    }
    const modal = await this.modalController.create({
      component: ClasseDialogPage,
      componentProps: {
        classe: classe ? { ...classe } : { nome: '', descrizione: '' },
        classeId: classeId || null
      }
    });
    const modalRef = await modal.present();
const {data,role} = await modal.onDidDismiss();
console.log("role ",role);
console.log("data",data);
if (data)
{
const editedClass = new ClasseModel(data);
console.log("data from dialog",editedClass)
if(!editedClass.key){
this.service.addClasse(editedClass).then(() => {
  this.toaster.presentToast({message:"Classe aggiunta con successo",duration:2000,position:"bottom"});
}).catch((error) => {
  this.toaster.presentToast({message:"Errore durante l'aggiunta della classe",duration:2000,position:"bottom"});
})  .finally(() => {

});
}else{
  this.service.updateClasse(classe!.key,editedClass).then(() => {
    this.toaster.presentToast({message:"Classe aggiornata con successo",duration:2000,position:"bottom"});
  }).catch((error) => {
    this.toaster.presentToast({message:"Errore durante l'aggiornamento della classe",duration:2000,position:"bottom"});
  })  .finally(() => {

  });
}}
  }
}

