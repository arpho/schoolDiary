import { Component, OnInit, computed, effect, signal, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required } from '@angular/forms/signals';
import { ModalController } from '@ionic/angular';
import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTextarea, IonFabButton, IonFab, IonFooter, IonToolbar, IonTitle, IonBackButton, IonButtons } from '@ionic/angular/standalone';

import { Criterio } from 'src/app/shared/models/criterio';
import { addIcons } from 'ionicons';
import {
  add,
  create,
  push,
  trash,
  close,
  save,
  ellipsisVertical
} from 'ionicons/icons';
import { Grids } from 'src/app/shared/models/grids';
import { IndicatorsListComponent } from "../components/indicatorsList/indicators-list/indicators-list.component";
import { Router } from '@angular/router';
import { IndicatorsDialogComponent } from '../components/indicatorsDialog/indicators-dialog.component';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { ActionSheetController } from '@ionic/angular';
import { IndicatorViewerComponent } from "src/app/shared/components/indicatorsViewer/indicator-viewer/indicator-viewer.component";
import { UsersService } from 'src/app/shared/services/users.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
/**
 * Pagina di dialogo per la creazione o modifica di una griglia di valutazione.
 * Gestisce i dettagli della griglia (nome, descrizione) e la lista degli indicatori associati.
 */
@Component({
  selector: 'app-gridsdialog',
  templateUrl: './gridsdialog.html',
  styleUrls: ['./gridsdialog.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonTextarea,
    IonFabButton,
    IonFab,
    IndicatorViewerComponent,
    IonFooter,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    FormField,
    FormRoot
  ]
})
export class GridsdialogPage implements OnInit {
  gridKey = ""
  pageTitle: any;

  constructor(
    private modalController: ModalController,
    private router: Router,
    private $users: UsersService,
    private $grids: GridsService,
    private $toaster: ToasterService,
    private actionSheetController: ActionSheetController,
  ) {
    addIcons({
      ellipsisVertical,
      push,
      add,
      create,
      close,
      trash,
      save,
    });
    effect(() => {
      console.log("indicatorsList", this.indicatorsList());
    });
    const navigation = this.router.currentNavigation();
    this.gridKey = navigation?.extras.state?.['gridKey'];
    console.log("gridKey", this.gridKey);
  }
  async storeGrid() {
    console.log("storeGrid", this.formValue());
    const grid = new Grids(this.formValue());
    const loggedUser = await this.$users.getLoggedUser();
    if (loggedUser) {
      grid.ownerKey = loggedUser.key;
    }
    console.log("grid", grid);
    console.log("serializzo", grid.serialize())
    if (this.gridKey) {
      this.$grids.updateGrid(this.gridKey, grid).then(() => {
        this.$toaster.showToast({ message: "Griglia aggiornata", duration: 2000, position: "bottom" });
      }).catch((error) => {
        this.$toaster.showToast({ message: "Errore aggiornamento griglia", duration: 2000, position: "bottom" });
      })
    }
    else {
      this.$grids.addGrid(grid).then(() => {
        this.$toaster.showToast({ message: "Griglia salvata", duration: 2000, position: "bottom" });
      }).catch((error) => {
        this.$toaster.showToast({ message: "Errore salvataggio griglia", duration: 2000, position: "bottom" });
      })
    }

  }
  async selectIndicator(indicator: Indicatore, index: number) {
    console.log("selectIndicator", indicator, index);
    const actionSheet = await this.actionSheetController.create({
      header: 'Select an option',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.removeIndicator(index);
          },
        },
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.editIndicator(indicator, index);
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
  removeIndicator(index: number) {
    this.indicatorsList.set([...this.indicatorsList().slice(0, index), ...this.indicatorsList().slice(index + 1)]);
  }
  async editIndicator(indicator: Indicatore, index: number) {
    console.log("editIndicator", indicator, index);
    const modal = await this.modalController.create({
      component: IndicatorsDialogComponent,
      componentProps: {
        indicatore: indicator
      }
    });
    await modal.present();
    modal.onDidDismiss().then((data) => {
      console.log("data", data);
      this.indicatorsList.set([...this.indicatorsList().slice(0, index), data.data, ...this.indicatorsList().slice(index + 1)]);
    });
  }
  async addIndicator() {
    const newIndicator = new Indicatore();
    const modal = await this.modalController.create({
      component: IndicatorsDialogComponent,
      componentProps: {
        indicatore: newIndicator
      }
    });
    await modal.present();
    modal.onDidDismiss().then((data) => {
      console.log("data", data);
      if (data.data) {
        this.indicatorsList.set([...this.indicatorsList(), data.data]);
      }
    });
  }

  gridModel = signal({
    nome: '',
    descrizione: ''
  });

  gridForm = form(this.gridModel, schema((s) => {
    required(s.nome);
  }));

  gridSignal = signal(new Grids());
  indicatorsList = signal(this.gridSignal().indicatori);
  valore = signal("");
  
  formValue = computed(() => {
    return {
      nome: this.gridModel().nome,
      descrizione: this.gridModel().descrizione,
      indicatori: this.indicatorsList(),
      valore: this.valore()
    }
  });

  ngOnInit(): void {
    this.gridForm().value.update(v => ({...v, ...({
      nome: this.gridSignal().nome,
      descrizione: this.gridSignal().descrizione
    })}));
    this.indicatorsList.set(this.gridSignal().indicatori);

    if (this.gridKey) {
      this.pageTitle = "Modifica Griglia";
      console.log("devo aprire la griglia con key", this.gridKey);

      this.$grids.fetchGrid(this.gridKey).then((grid) => {
        console.log("grid", grid);
        this.gridSignal.set(grid);
        this.indicatorsList.set(grid.indicatori);
        this.gridForm().value.update(v => ({...v, ...({
          nome: grid.nome,
          descrizione: grid.descrizione
        })}));
      });
    }
    else {
      this.pageTitle = "Crea Griglia";
    }

  }
}