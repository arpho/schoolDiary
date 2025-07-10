import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { Grids } from 'src/app/shared/models/grids';
import { GridsService } from 'src/app/shared/services/grids/grids.service';

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
  ]
})
export class GridsList implements OnInit {
showList =computed(() => this.gridsList().length > 0);

  gridsList = signal<Grids[]>([]);

  constructor(private service: GridsService) {
  }

  ngOnInit(): void {
    const cb = (grids: Grids[]) => {
      this.gridsList.set(grids);
    };
    this.service.getGridsOnRealtime(cb);
  }
}
