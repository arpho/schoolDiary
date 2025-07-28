import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { signal } from '@angular/core';
import { ActivityModel } from '../../../models/activityModel';
import { ClasseModel } from '../../../../../pages//classes/models/classModel';
import { ClassiService } from '../../../../classes/services/classi.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-dialog-activity',
  templateUrl: './dialog-activity.component.html',
  styleUrls: ['./dialog-activity.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogActivityComponent implements OnInit {
  activity = new ActivityModel();
  elencoClassi = signal<ClasseModel[]>([]);

  constructor(
    private classiService: ClassiService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.classiService.getClassiOnRealtime((classi:ClasseModel[]) => {
      this.elencoClassi.set(classi);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    // Implement save logic here
    this.modalCtrl.dismiss(this.activity);
  }
}
