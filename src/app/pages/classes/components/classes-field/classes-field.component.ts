import {
  Component,
  forwardRef,
  signal,
  effect,
  inject,
  model,
  output,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ClassViewerComponent } from '../class-viewer/class-viewer.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonItem, IonList, IonButton, IonIcon, ModalController, IonFabButton, IonFab } from "@ionic/angular/standalone";
import { ClassesSelectorPage } from '../../pages/classes-selector/classes-selector.page';
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
import { addIcons } from 'ionicons';
import { list } from 'ionicons/icons';

/**
 * Componente form field per la selezione multipla di classi.
 * Implementa `ControlValueAccessor` per integrarsi con i form di Angular.
 */
@Component({
  selector: 'app-classes-field',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonButton,
    IonIcon,
    ClassViewerComponent,
    FormsModule,
    IonFabButton,
    IonFab
  ],
  templateUrl: './classes-field.component.html',
  styleUrls: ['./classes-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClassesFieldComponent),
      multi: true
    }
  ],
})
export class ClassesFieldComponent implements ControlValueAccessor {
  disabled = input<boolean>(false);
  classeschange = output<AssignedClass[]>();

  classes = model<AssignedClass[]>([]);

  private readonly classiService = inject(ClassiService);
  private readonly modalController = inject(ModalController);

  classi = toSignal(this.classiService.getClassiOnRealtime(), { initialValue: [] });

  onChange: (value: AssignedClass[]) => void = () => { };
  onTouched: () => void = () => { };

  trackByFn(index: number, item: ClasseModel): string {
    return item.key;
  }

  constructor() {
    addIcons({ list });

    effect(() => {
      const currentClasses = this.classes();
      console.log("Effect - classi aggiornate:", currentClasses);
      this.onChange(currentClasses);
      this.classeschange.emit(currentClasses);
    });
  }

  /**
   * Apre il modale per selezionare le classi.
   * Aggiorna il valore del field con le classi selezionate.
   */
  async selectClasses() {
    const modal = await this.modalController.create({
      component: ClassesSelectorPage,
      componentProps: {
        selectedClasses: [...this.classes()]
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data) {
      console.log("Classi selezionate:", data);
      this.classes.set(data);
    }
  }

  /**
   * Scrive un nuovo valore nel componente (dal form model alla view).
   */
  writeValue(value: AssignedClass[]): void {
    console.log("writeValue", value);
    if (value && JSON.stringify(this.classes()) !== JSON.stringify(value)) {
      console.log("writeValue - classi aggiornate:", value);
      this.classes.set([...value]);
    }
  }

  /**
   * Registra la funzione di callback chiamata quando il valore cambia (dalla view al form model).
   */
  registerOnChange(fn: (value: AssignedClass[]) => void): void {
    this.onChange = (value: AssignedClass[]) => {
      fn(value);
      this.classeschange.emit(value);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
