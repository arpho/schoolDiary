import { Component, input, signal, inject } from '@angular/core';
import { ClassiService } from '../../../pages/classes/services/classi.service';
import { ClasseModel } from '../../../pages/classes/models/classModel';

@Component({
  selector: 'app-class-wiever',
  templateUrl: './class-wiever.component.html',
  styleUrls: ['./class-wiever.component.scss'],
})
export class ClassViewerComponent {
  private classiService = inject(ClassiService);
  classkey = input<string>();
  classe = signal<ClasseModel | undefined>(undefined);

  constructor() {
    this.updateClasse();
  }

  async updateClasse() {
    const key = this.classkey();
    if (key) {
      const classe = await this.classiService.fetchClasseOnCache(key);
      this.classe.set(classe);
    }
  }

  ngOnChanges() {
    this.updateClasse();
  }
}
