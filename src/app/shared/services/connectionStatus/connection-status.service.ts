import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConnectionStatus } from '../../models/connectionStatus';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService implements OnDestroy {
  private destroy$ = new Subject<void>();
  connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(
    navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline
  );
  
  connectionStatus$ = this.connectionStatusSubject.asObservable();
  connectionStatusMessage = 'Checking connection...';

  constructor() {
    console.log('ConnectionStatusService - Initial status:', this.connectionStatus);
    this.initializeConnectionEvents();
  }

  private initializeConnectionEvents(): void {
    // Inizializza con lo stato corrente
    this.updateConnectionStatus(navigator.onLine);
    
    // Gestione evento online
    fromEvent(window, 'online').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('ConnectionStatusService - Online event received');
      this.updateConnectionStatus(true);
    });

    // Gestione evento offline
    fromEvent(window, 'offline').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('ConnectionStatusService - Offline event received');
      this.updateConnectionStatus(false);
    });
  }
  
  private updateConnectionStatus(isOnline: boolean): void {
    const status = isOnline ? ConnectionStatus.Online : ConnectionStatus.Offline;
    this.connectionStatusMessage = isOnline 
      ? 'Back to online' 
      : 'Connection lost! You are not connected to internet';
      
    console.log(`ConnectionStatusService - Updating status to: ${status === ConnectionStatus.Online ? 'Online' : 'Offline'}`);
    this.connectionStatusSubject.next(status);
  }

  get connectionStatus(): ConnectionStatus {
    return this.connectionStatusSubject.value;
  }

  ngOnDestroy(): void {
    console.log('ConnectionStatusService - Destroying service');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
