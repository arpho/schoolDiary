import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionStatus } from 'src/app/shared/models/connectionStatus';
import { IonIcon } from '@ionic/angular/standalone';
import { ConnectionStatusService } from 'src/app/shared/services/connectionStatus/connection-status.service';

/**
 * Componente che visualizza lo stato della connessione (Online/Offline).
 * Ascolta gli eventi window e usa un servizio di fallback.
 */
@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [IonIcon, CommonModule],
  template: `
    <div class="status-container">
      @if(isOnline) {
        <ion-icon name="wifi" title="Online"></ion-icon>
      } @else {
        <ion-icon name="wifi-outline" title="Offline"></ion-icon>
      }
    </div>
  `,
  styles: [`
    .status-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: 1px solid transparent;
      border-radius: 50%;
      background: rgba(var(--ion-color-primary-rgb), 0.1);
    }
    ion-icon {
      font-size: 20px;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ion-color-primary);
    }
    
    /* Stile per lo stato offline */
    :host-context(.ion-color-danger) ion-icon {
      color: var(--ion-color-danger);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  // Esponi l'enum al template
  readonly ConnectionStatus = ConnectionStatus;
  private connectionStatusService = inject(ConnectionStatusService);
  private cdr = inject(ChangeDetectorRef);

  isOnline = navigator.onLine;
  $connectionStatus = signal<ConnectionStatus>(
    this.isOnline ? ConnectionStatus.Online : ConnectionStatus.Offline
  );

  constructor() {
    console.log('ConnectionStatusComponent - Constructor');
  }

  ngOnInit() {
    console.log('ConnectionStatusComponent - OnInit');

    // Imposta i listener per gli eventi online/offline
    window.addEventListener('online', this.handleConnectionChange);
    window.addEventListener('offline', this.handleConnectionChange);

    // Sottoscrizione al servizio come fallback
    this.connectionStatusService.connectionStatus$.subscribe(status => {
      this.isOnline = status === ConnectionStatus.Online;
      this.$connectionStatus.set(status);
      this.cdr.detectChanges();
    });
  }

  private handleConnectionChange = (event: Event) => {
    this.isOnline = event.type === 'online';
    const newStatus = this.isOnline ? ConnectionStatus.Online : ConnectionStatus.Offline;
    this.$connectionStatus.set(newStatus);
    this.cdr.detectChanges();
  };

  ngOnDestroy() {
    console.log('ConnectionStatusComponent - OnDestroy');
    window.removeEventListener('online', this.handleConnectionChange);
    window.removeEventListener('offline', this.handleConnectionChange);
  }
}


