import { Injectable } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  wifi,
  wifiOutline
} from 'ionicons/icons';

/**
 * Servizio per la gestione centralizzata delle icone Ionic.
 * Registra le icone all'avvio dell'applicazione per renderle disponibili ovunque.
 */
@Injectable({
  providedIn: 'root'
})
export class IconService {
  constructor() {
    // Registra le icone all'avvio del servizio
    addIcons({
      wifi,
      'wifi-outline': wifiOutline
      // Aggiungi qui altre icone utilizzate nell'applicazione
    });
  }
}
