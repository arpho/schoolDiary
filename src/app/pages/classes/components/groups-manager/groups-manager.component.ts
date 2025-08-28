import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsService } from '../../services/groups/groups.service';
import { GroupModel } from '../../models/groupModel';
import { IonButton, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { add, medkit } from 'ionicons/icons';
import { ClassiService } from '../../services/classi.service';
import { ClasseModel } from '../../models/classModel';

@Component({
  selector: 'app-groups-manager',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,

  ],
  templateUrl: './groups-manager.component.html',
  styleUrls: ['./groups-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsManagerComponent implements OnInit {
addGroup() {
console.log("addGroup")
}
  // Usiamo input.required per assicurarci che il valore sia sempre fornito
  classkey = input.required<string>();
  
  private service = inject(GroupsService);
  private classi= inject(ClassiService);
  groupslist = signal<GroupModel[]>([]);
  classe = signal<ClasseModel | null>(null);
  private unsubscribeFn: (() => void) | null = null;

  constructor() {
    addIcons({medkit});
    // Effetto reattivo che si attiva quando classkey cambia
    effect(async () => {
      const key = this.classkey();
      console.log('classkey changed to#:', key);
      const classe = await this.classi.fetchClasse(key);
      console.log("classe#", classe);
      this.classe.set(classe);
      this.loadGroups(key);
    });
  }

  async ngOnInit() {

}

  private loadGroups(classKey: string) {
    console.log("loadGroups #", classKey);
    this.service.fetchGroups4class(classKey, (groups) => {
      console.log('Gruppi ricevuti:', groups);
      this.groupslist.set(groups);
    });
    // Annulla la sottoscrizione precedente se esiste
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }

    if (!classKey) {
      console.warn('Nessun classKey fornito');

    }

    console.log('Caricamento gruppi per classKey:', classKey);
    this.unsubscribeFn = this.service.fetchGroups4class(classKey, (groups) => {
      console.log('Gruppi ricevuti:', groups);
      this.groupslist.set(groups);
    });
  }

  ngOnDestroy() {
    // Pulisci la sottoscrizione quando il componente viene distrutto
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
    }
  }
}
