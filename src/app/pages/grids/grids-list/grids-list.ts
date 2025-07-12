import { Component, computed, OnInit, signal, inject } from '@angular/core';
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
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import {
  Grids
} from 'src/app/shared/models/grids';
import {
  GridsService
} from 'src/app/shared/services/grids/grids.service';
import {
    addIcons
} from 'ionicons';
import {
    add,
    addCircleOutline
} from 'ionicons/icons';
import {
    ModalController
} from '@ionic/angular';
import {
    GridsdialogPage
} from '../gridsdialog/gridsdialog';


@Component({
  selector: 'app-grids-list',
  templateUrl: './grids-list.html',
  styleUrls: ['./grids-list.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon]
})
export class GridsListComponent implements OnInit {


openGridDialog = async () => {
  const grid = new Grids();
    const modal = await this.modalController.create({
        component: GridsdialogPage,
        componentProps: {
            grid
        }
    });
    await modal.present();
};
  showList = computed(() => this.gridsList().length > 0);

  gridsList = signal<Grids[]>([]);

  constructor(private modalController: ModalController,
    private service: GridsService
  ) {
    addIcons({add});
  }

  ngOnInit(): void {
    const cb = (grids: Grids[]) => {
      this.gridsList.set(grids);
    };
    this.service.getGridsOnRealtime(cb);
  }
}
