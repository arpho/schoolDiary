import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonList,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  ActionSheetController,
  AlertController,
  ModalController,
  ModalOptions
} from '@ionic/angular/standalone';

import { ClassiService } from '../services/classi.service';
import { ClasseModel } from '../models/classModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { addIcons } from 'ionicons';
import { add, create, trash, close, archive, ellipsisVertical, eye } from 'ionicons/icons';

/**
 * Componente per visualizzare la lista delle classi.
 * Permette di visualizzare, modificare, eliminare e archiviare le classi.
 */
@Component({
  selector: 'app-classes-list',
  templateUrl: './classes-list.html',
  styleUrls: ['./classes-list.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonList,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon
  ]
})
export class ClassesListComponent implements OnInit, OnDestroy {
  classiList = signal<ClasseModel[]>([]);
  private sub: Subscription = new Subscription();

  sortedClassiList = computed(() =>
    [...this.classiList()].sort((a, b) => {
      const keyA = `${a.classe}${a.year}`;
      const keyB = `${b.classe}${b.year}`;
      return keyA.localeCompare(keyB);
    })
  );

  constructor(
    private service: ClassiService,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private toaster: ToasterService
  ) {
    addIcons({ add, eye, trash, close, archive, ellipsisVertical });
  }

  ngOnInit(): void {
    this.sub.add(
      this.service.getClassiOnRealtime()
        .subscribe((classi) => {
          this.classiList.set(classi);
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Gestisce il click su una classe aprendo un action sheet con le opzioni disponibili.
   * @param classe Modello della classe selezionata.
   */
  async clickedClass(classe: ClasseModel) {
    const actionSheet = await this.actionSheetController.create({
      header: `Classe ${classe.classe} - ${classe.year}`,
      subHeader: classe.descrizione || 'Nessuna descrizione',
      buttons: [
        {
          text: 'Visualizza',
          icon: 'eye',
          handler: () => {
            this.editClass(classe.key);
          }
        },
        {
          text: 'Elimina',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteClass(classe);
          }
        },
        {
          text: 'Archivia',
          icon: 'archive',
          handler: () => {
            this.archives(classe.key);
          }
        },
        {
          text: 'Annulla',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    await actionSheet.present();
  }

  archives(key: string) {
    // TODO: Implement archive functionality
    console.log('Archiving class with key:', key);
  }

  editClass(key: string) {
    this.go2ClasseDialog(key);
  }

  async deleteClass(classe: ClasseModel) {
    const alert = await this.alertController.create({
      header: 'Elimina Classe',
      message: `Sei sicuro di voler eliminare la classe ${classe.classe}?`,
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          handler: () => {
            // Azione annullata
          }
        },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.service.deleteClasse(classe.key)
              .then(() => {
                this.toaster.presentToast({
                  message: 'Classe eliminata con successo',
                  duration: 2000,
                  position: 'bottom'
                });
              })
              .catch((error) => {
                console.error('Errore durante l\'eliminazione della classe:', error);
                this.toaster.presentToast({
                  message: "Errore durante l'eliminazione della classe",
                  duration: 2000,
                  position: 'bottom'
                });
              });
          }
        }
      ]
    });

    await alert.present();
  }

  go2ClasseDialog(classeId: string = ''): void {
    this.router.navigate(['/class-dialog', classeId]);
  }
}

