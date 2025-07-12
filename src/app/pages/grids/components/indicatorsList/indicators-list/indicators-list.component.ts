import { Component, model, OnInit } from '@angular/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { IndicatorsDialogComponent } from "../../indicatorsDialog/indicators-dialog.component";

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.scss'],
  imports: [IndicatorsDialogComponent],
})
export class IndicatorsListComponent  implements OnInit {
indicatorslist = model<Indicatore[]>([]);
  constructor(
    private service: GridsService
  ) { }

  ngOnInit() {

    console.log("indicatorsList",this.indicatorslist());
  }

}
