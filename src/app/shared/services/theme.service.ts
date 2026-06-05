import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public currentTheme = signal<ThemeMode>('system');

  constructor() { }

  public initializeTheme() {
    const savedTheme = localStorage.getItem('theme-preference') as ThemeMode;
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      this.applyTheme('system');
    }

    // Aggiungi un listener per i cambiamenti del sistema se il tema è "system"
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.currentTheme() === 'system') {
        this.toggleDarkPalette(e.matches);
      }
    });
  }

  public setTheme(theme: ThemeMode) {
    this.currentTheme.set(theme);
    localStorage.setItem('theme-preference', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode) {
    if (theme === 'dark') {
      this.toggleDarkPalette(true);
    } else if (theme === 'light') {
      this.toggleDarkPalette(false);
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.toggleDarkPalette(prefersDark);
    }
  }

  private toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
}
