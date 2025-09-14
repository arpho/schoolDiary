import { 
  Component, 
  inject, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef, 
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionStatus } from 'src/app/shared/models/connectionStatus';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';
import { ConnectionStatusService } from 'src/app/shared/services/connectionStatus/connection-status.service';

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
    }
    ion-icon {
      font-size: 20px;
      color: var(--ion-color-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  private connectionStatusService = inject(ConnectionStatusService);
  $connectionStatus = signal<ConnectionStatus>(this.connectionStatusService.connectionStatus);
  private cdr = inject(ChangeDetectorRef);
  
  isOnline = navigator.onLine;
  
  constructor() {
    console.log('ConnectionStatusComponent - Constructor');
    
    // Registra le icone
    addIcons({ 
      'wifi': wifi, 
      'wifi-outline': wifiOutline 
    });
  }
  
  ngOnInit() {
    console.log('ConnectionStatusComponent - OnInit');
    
    // Imposta i listener per gli eventi online/offline
    window.addEventListener('online', this.handleConnectionChange);
    window.addEventListener('offline', this.handleConnectionChange);
    
    // Sottoscrizione al servizio come fallback
    this.connectionStatusService.connectionStatus$.subscribe(status => {
      this.isOnline = status === ConnectionStatus.Online;
      this.cdr.detectChanges();
    });
  }
  
  private handleConnectionChange = (event: Event) => {
    this.isOnline = event.type === 'online';
    console.log('Connection changed:', this.isOnline ? 'Online' : 'Offline');
    console.log("connesssione",this.connectionStatusService.connectionStatus)
    this.$connectionStatus.set(this.connectionStatusService.connectionStatus);
    console.log("segnale di connessione",this.$connectionStatus())
    this.cdr.detectChanges();
  };
  
  ngOnDestroy() {
    console.log('ConnectionStatusComponent - OnDestroy');
    window.removeEventListener('online', this.handleConnectionChange);
    window.removeEventListener('offline', this.handleConnectionChange);
  }
}


