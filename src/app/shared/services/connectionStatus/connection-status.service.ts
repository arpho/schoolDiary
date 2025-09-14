import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { ConnectionStatus } from '../../models/connectionStatus';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  onlineEvent: Observable<Event> | undefined;
  offlineEvent!: Observable<Event>;
  subscriptions: Subscription[] = [];
  connectionStatusMessage!: string;
  connectionStatus!: ConnectionStatus ;

  constructor() {

        /**
    * Get the online/offline status from browser window
    */
        this.onlineEvent = fromEvent(window, 'online');
        this.offlineEvent = fromEvent(window, 'offline');
        /**
        * Get the online status as observable
        */
        this.subscriptions.push(this.onlineEvent.subscribe(e => {
          this.connectionStatusMessage = 'Back to online';
          this.connectionStatus = ConnectionStatus.Online;
          console.log('Online...');
        }));
    
        /**
        * Get the offline status as observable
        */
        this.subscriptions.push(this.offlineEvent.subscribe(e => {
          this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
          this.connectionStatus = ConnectionStatus.Offline;
          console.log('Offline...');
        }));
   }
}
