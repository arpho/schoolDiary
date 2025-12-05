import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Unsubscribe } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions: Unsubscribe[] = [];

  /**
   * Aggiunge una sottoscrizione da gestire
   */
  addSubscription(unsubscribeFn: Unsubscribe): void {
    this.subscriptions.push(unsubscribeFn);
  }

  /**
   * Annulla tutte le sottoscrizioni
   */
  unsubscribeAll(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }

  /**
   * Ottieni l'oggetto Subject per l'uso con takeUntil
   */
  get onDestroy$() {
    return this.destroy$.asObservable();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }
}
