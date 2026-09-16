import { Component, computed, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  ActionSheetController,
  AlertController,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonBadge
} from '@ionic/angular/standalone';

import { ClassiService } from '../services/classi.service';
import { ClasseModel } from '../models/classModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { add, create, trash, close, archive, ellipsisVertical, eye, warningOutline } from 'ionicons/icons';

/**
 * Componente per visualizzare la lista delle classi.
 * Permette di visualizzare, modificare, eliminare e archiviare le classi.
 */
@Component({
  selector: 'app-classes-list',
  templateUrl: './classes-list.html',
  styleUrls: ['./classes-list.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonBadge
]
})
export class ClassesListComponent implements OnInit, OnDestroy {
  classiList = toSignal(this.service.getClassiOnRealtime(), { initialValue: [] });

  sortedClassiList = computed(() =>
    [...this.classiList()].sort((a, b) => {
      const keyA = `${a.classe}${a.year}`;
      const keyB = `${b.classe}${b.year}`;
      return keyA.localeCompare(keyB);
    })
  );

  studentsCountByClass = signal<Record<string, number>>({});
  private unsubscribeUsers: (() => void) | null = null;

  constructor(
    private service: ClassiService,
    private usersService: UsersService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private toaster: ToasterService
  ) {
    addIcons({ add, eye, trash, close, archive, ellipsisVertical, 'warning-outline': warningOutline });
  }

  ngOnInit() {
    this.unsubscribeUsers = this.usersService.getUsersOnRealTime((users) => {
      const counts: Record<string, number> = {};
      users.forEach(u => {
        // Usa classKey se presente (studente), o loop su assignedClasses/classes se docente,
        // ma la richiesta è per gli studenti
        if (u.classKey) {
          counts[u.classKey] = (counts[u.classKey] || 0) + 1;
        } else if (u.classes && u.classes.length > 0) {
          u.classes.forEach(c => counts[c] = (counts[c] || 0) + 1);
        }
      });
      this.studentsCountByClass.set(counts);
    }, [new QueryCondition('role', '==', UsersRole.STUDENT)]);
  }

  ngOnDestroy() {
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
    }
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
    this.service.archiviaClasse(key).then(() => {
      this.toaster.presentToast({
        message: 'Classe archiviata con successo',
        duration: 2000,
        position: 'bottom'
      });
    }).catch(err => {
      console.error('Errore durante l\'archiviazione:', err);
      this.toaster.presentToast({
        message: 'Errore durante l\'archiviazione della classe',
        duration: 2000,
        position: 'bottom'
      });
    });
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

  /**
   * Genera un colore univoco basato sul nome della classe.
   * @param classe Modello della classe.
   * @returns Stringa colore in formato HSL.
   */
  getClassColor(classe: ClasseModel): string {
    let hash = 0;
    const str = classe.classe + classe.year;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 50%)`;
  }
}

