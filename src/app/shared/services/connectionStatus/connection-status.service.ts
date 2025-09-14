import { Injectable } from '@angular/core';
import { fromEvent, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { ConnectionStatus } from '../../models/connectionStatus';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  onlineEvent: Observable<Event> | undefined;
  offlineEvent!: Observable<Event>;
  subscriptions: Subscription[] = [];
  connectionStatusMessage = 'Checking connection...';
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline);
  connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  get connectionStatus(): ConnectionStatus {
    return this.connectionStatusSubject.value;
  }

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
          this.connectionStatusSubject.next(ConnectionStatus.Online);
          console.log('#Online...');
        }));
    
        /**
        * Get the offline status as observable
        */
        this.subscriptions.push(this.offlineEvent.subscribe(e => {
          this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
          this.connectionStatusSubject.next(ConnectionStatus.Offline);
          console.log('#Offline...');
        }));
   }
}
