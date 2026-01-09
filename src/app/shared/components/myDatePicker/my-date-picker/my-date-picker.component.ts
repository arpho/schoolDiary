import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarNumber } from 'ionicons/icons';

/**
 * Componente personalizzato per la selezione della data.
 * Implementa `ControlValueAccessor` per l'uso nei form Angular.
 */
@Component({
  selector: 'app-my-date-picker',
  templateUrl: './my-date-picker.component.html',
  styleUrls: ['./my-date-picker.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyDatePickerComponent),
      multi: true
    }
  ],
  imports: [
    IonButton,
    IonIcon
  ]
})
export class MyDatePickerComponent implements ControlValueAccessor {
  /** Valore della data in stringa */
  @Input() data: string = "";
  onChange: any = () => { };
  onTouched: any = () => { };
  disabled: boolean = false;


  constructor() {
    addIcons({
      calendarNumber
    })
  }
  writeValue(value: string): void {
    this.data = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }



}
