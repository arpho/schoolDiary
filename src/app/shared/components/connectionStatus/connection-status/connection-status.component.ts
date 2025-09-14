import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionStatus } from 'src/app/shared/models/connectionStatus';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';
import { ConnectionStatusService } from 'src/app/shared/services/connectionStatus/connection-status.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [IonIcon, CommonModule],
  template: `
    @if(connectionStatus() === _connectionStatus.Online) {
      <ion-icon name="wifi"></ion-icon>
    } @else {
      <ion-icon name="wifi-outline"></ion-icon>
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    ion-icon {
      font-size: 24px;
      color: var(--ion-color-primary);
      --ionicon-stroke-width: 40px;
    }
  `]
})
export class ConnectionStatusComponent implements OnInit {
  private connectionStatusService = inject(ConnectionStatusService);
  
  connectionStatus = signal<ConnectionStatus>(ConnectionStatus.Offline);
  _connectionStatus = ConnectionStatus;
  
  constructor() {
    // Registra le icone in modo esplicito
    addIcons({ 
      'wifi': wifi, 
      'wifi-outline': wifiOutline 
    });
    
    // Inizializza lo stato corrente
    this.connectionStatus.set(this.connectionStatusService.connectionStatus);
    console.log('Initial connection status:', this.connectionStatus());
    
    // Sottoscrivi ai cambiamenti dello stato di connessione
    this.connectionStatusService.connectionStatus$
      .pipe(takeUntilDestroyed())
      .subscribe(status => {
        console.log('Connection status changed to:', status);
        this.connectionStatus.set(status);
      });
  }

  ngOnInit() {
    // Logica di inizializzazione aggiuntiva se necessaria
  }
}


