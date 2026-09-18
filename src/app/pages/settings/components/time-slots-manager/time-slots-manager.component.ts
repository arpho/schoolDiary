import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, save } from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';
import { SchoolTimeSlot, UserModel } from 'src/app/shared/models/userModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';

@Component({
  selector: 'app-time-slots-manager',
  templateUrl: './time-slots-manager.component.html',
  styleUrls: ['./time-slots-manager.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonListHeader, IonItemSliding, IonItemOptions, IonItemOption, IonText
  ]
})
export class TimeSlotsManagerComponent implements OnInit {
  private usersService = inject(UsersService);
  private toaster = inject(ToasterService);

  slots = signal<SchoolTimeSlot[]>([]);
  private currentUser: UserModel | null = null;
  hasChanges = signal<boolean>(false);

  constructor() {
    addIcons({ add, trash, save });
  }

  async ngOnInit() {
    this.currentUser = await this.usersService.getLoggedUser();
    if (this.currentUser) {
      if (this.currentUser.schoolTimeSlots && this.currentUser.schoolTimeSlots.length > 0) {
        // Copia per non modificare direttamente l'oggetto utente fino al salvataggio
        this.slots.set(JSON.parse(JSON.stringify(this.currentUser.schoolTimeSlots)));
      } else {
        // Imposta slot di default se non presenti
        this.slots.set([
          { name: '1° Ora', startTime: '08:00', endTime: '09:00' },
          { name: '2° Ora', startTime: '09:00', endTime: '10:00' },
          { name: 'Intervallo', startTime: '10:00', endTime: '10:15' },
          { name: '3° Ora', startTime: '10:15', endTime: '11:15' },
          { name: '4° Ora', startTime: '11:15', endTime: '12:15' },
          { name: '5° Ora', startTime: '12:15', endTime: '13:15' }
        ]);
        this.hasChanges.set(true);
      }
    }
  }

  addSlot() {
    const currentSlots = this.slots();
    let defaultStart = '08:00';
    let defaultEnd = '09:00';
    if (currentSlots.length > 0) {
      defaultStart = currentSlots[currentSlots.length - 1].endTime;
      // aggiungi 1 ora come default
      const [h, m] = defaultStart.split(':').map(Number);
      const nextH = (h + 1).toString().padStart(2, '0');
      defaultEnd = `${nextH}:${m.toString().padStart(2, '0')}`;
    }
    this.slots.update(slots => [...slots, { name: 'Nuovo Slot', startTime: defaultStart, endTime: defaultEnd }]);
    this.hasChanges.set(true);
  }

  removeSlot(index: number) {
    this.slots.update(slots => slots.filter((_, i) => i !== index));
    this.hasChanges.set(true);
  }

  updateSlot(index: number, field: keyof SchoolTimeSlot, value: string) {
    this.slots.update(slots => {
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return newSlots;
    });
    this.hasChanges.set(true);
  }

  async save() {
    if (!this.currentUser || !this.currentUser.key) return;

    this.currentUser.schoolTimeSlots = this.slots();
    try {
      await this.usersService.updateUser(this.currentUser.key, this.currentUser);
      this.hasChanges.set(false);
      this.toaster.presentToast({ message: 'Scansione oraria salvata con successo', duration: 2000, position: 'bottom' });
    } catch (e) {
      console.error(e);
      this.toaster.presentToast({ message: 'Errore durante il salvataggio', duration: 2000, position: 'bottom' });
    }
  }
}
