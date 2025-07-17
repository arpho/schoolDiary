import {
  Component,
  Input,
  OnInit,
  forwardRef,
  signal,
  computed,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { ClasseModel } from '../../models/classModel';
import {
  IonItem,
  IonList
} from "@ionic/angular/standalone";
import { ClassViewerComponent } from "../class-viewer/class-viewer.component";
import { ClassiService } from '../../services/classi.service';
import {
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import {
  add,
  list
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ModalController } from '@ionic/angular';
import { ClassesSelectorPage } from '../../pages/classes-selector/classes-selector.page';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    ClassViewerComponent,
    FormsModule,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption
  ],
  selector: 'app-classes-field',
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
export class ClassesFieldComponent implements OnInit, ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Input() classes: ClasseModel[] = [];
  onChange: any = () => {};
  onTouched: any = () => {};
  classi = signal<ClasseModel[]>([]);

  trackByFn(index: number, item: ClasseModel): string {
    return item.key;
  }
 

  constructor(
    private $classes: ClassiService,
    private $modal: ModalController
  ) {
    addIcons({
       add,
       list 
    });
   }

  async selectClasses() {
const modal = await this.$modal.create({
  component: ClassesSelectorPage,
  componentProps: {
    selectedClasses: this.classes
  }
});
const modalRef = await modal.present();
const {data,role} = await modal.onDidDismiss();
console.log("role ",role);
console.log("data",data);
if (data)
{
this.classes = data;
this.onChange(this.classes);
}
}

  ngOnInit() {
    this.$classes.getClassiOnRealtime((classi) => {
      this.classi.set(classi);
    });
  }

  writeValue(value: ClasseModel[]): void {
    console.log("writeValue", value);
    this.classes = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
