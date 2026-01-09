import { Component, input, signal, inject } from '@angular/core';
import { ClassiService } from '../../../pages/classes/services/classi.service';
import { ClasseModel } from '../../../pages/classes/models/classModel';

/**
 * Componente per visualizzare i dettagli di una classe (nome, anno).
 * Recupera i dati dalla cache se necessario.
 */
@Component({
  selector: 'app-class-wiever',
  templateUrl: './class-wiever.component.html',
  styleUrls: ['./class-wiever.component.scss'],
})
export class ClassViewerComponent {
  private classiService = inject(ClassiService);
  /** Chiave della classe da visualizzare */
  classkey = input<string>();
  /** Signal con il modello della classe recuperato */
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
