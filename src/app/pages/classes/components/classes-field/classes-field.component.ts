import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  Output, 
  EventEmitter, 
  forwardRef, 
  signal, 
  effect, 
  inject,
  DestroyRef,
  model
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ClassViewerComponent } from '../class-viewer/class-viewer.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonItem, IonList, IonButton, IonIcon, ModalController, IonFabButton, IonFab } from "@ionic/angular/standalone";
import { ClassesSelectorPage } from '../../pages/classes-selector/classes-selector.page';
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
export class ClassesFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Output() classeschange = new EventEmitter<ClasseModel[]>();
  
  classes = model<ClasseModel[]>([]);
  classi = signal<ClasseModel[]>([]);
  
  onChange: (value: ClasseModel[]) => void = () => {};
  onTouched: () => void = () => {};
  
  private destroyRef = inject(DestroyRef);
  private classiService = inject(ClassiService);
  private modalController = inject(ModalController);

  trackByFn(index: number, item: ClasseModel): string {
    return item.key;
  }


  constructor() {}
  
  private setupClassesEffect() {
    const classesEffect = effect(() => {
      const currentClasses = this.classes();
      console.log("Effect - classi aggiornate:", currentClasses);
      this.onChange(currentClasses);
      this.classeschange.emit(currentClasses);
    });

    // Pulisci l'effect quando il componente viene distrutto
    this.destroyRef.onDestroy(() => {
      classesEffect.destroy();
    });
  }

  async selectClasses() {
    const modal = await this.modalController.create({
      component: ClassesSelectorPage,
      componentProps: {
        selectedClasses: [...this.classes()]
      }
    });
    
    const { data } = await modal.onDidDismiss();
    
    if (data) {
      console.log("Classi selezionate:", data);
      this.classes.set(data);
    }
  }

  ngOnInit() {
    console.log("ngOnInit - classi*:", this.classes());
    
    // Configura l'effect dopo l'inizializzazione
    this.setupClassesEffect();
    
    // Carica le classi disponibili
    this.classiService.getClassiOnRealtime((classi) => {
      this.classi.set(classi);
    });
  }

  ngOnDestroy() {
    // Pulizia aggiuntiva se necessaria
  }

  writeValue(value: ClasseModel[]): void {
    console.log("writeValue", value);
    if (value && JSON.stringify(this.classes()) !== JSON.stringify(value)) {
      this.classes.set([...value]);
    }
  }

  registerOnChange(fn: (value: ClasseModel[]) => void): void {
    this.onChange = (value: ClasseModel[]) => {
      fn(value);
      this.classeschange.emit(value);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
