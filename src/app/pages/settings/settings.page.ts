import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonIcon
} from '@ionic/angular/standalone';
import { ThemeService, ThemeMode } from '../../shared/services/theme.service';
import { addIcons } from 'ionicons';
import { colorPaletteOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [UserMenuComponent, 
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class SettingsPage {
  private themeService = inject(ThemeService);

  constructor() {
    addIcons({ colorPaletteOutline });
  }

  get currentTheme(): ThemeMode {
    return this.themeService.currentTheme();
  }

  onThemeChange(event: any) {
    const newTheme = event.detail.value as ThemeMode;
    this.themeService.setTheme(newTheme);
  }
}
