import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Grids } from 'src/app/shared/models/grids';

@Component({
  selector: 'app-evaluate-grid',
  templateUrl: './evaluate-grid.component.html',
  styleUrls: ['./evaluate-grid.component.scss'],
})
export class EvaluateGridComponent  implements OnInit, OnChanges {
  @Input() grid: Grids = new Grids(); 

  constructor() { }

  ngOnInit() {
    console.log("grid to show", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid']) {
      console.log("grid changed", this.grid);
    }
  }
}
