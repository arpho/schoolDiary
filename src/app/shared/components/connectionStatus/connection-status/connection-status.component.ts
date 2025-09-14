import { Component, inject, OnInit, signal } from '@angular/core';
import { ConnectionStatus } from 'src/app/shared/models/connectionStatus';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';
import { ConnectionStatusService } from 'src/app/shared/services/connectionStatus/connection-status.service';

@Component({
  selector: 'app-connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.scss'],
  imports: [IonIcon]
})
export class ConnectionStatusComponent  implements OnInit {
  $connectionStatus= signal<ConnectionStatus>(ConnectionStatus.Offline);
 _connectionStatusService= inject(ConnectionStatusService);
 _connectionStatus = ConnectionStatus;
  constructor() { 
    addIcons({offline:wifiOutline,online:wifi})
  }

  ngOnInit() {
    this._connectionStatusService.connectionStatus
  }
}


