import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Service per gestire automaticamente le unsubscribe di RxJS e Firebase
 * 
 * Questo servizio previene memory leak gestendo automaticamente la pulizia
 * di tutte le subscription quando il componente viene distrutto.
 * 
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-my-component',
 *   providers: [UnsubscribeService] // Importante: fornito a livello di componente!
 * })
 * export class MyComponent implements OnInit {
 *   constructor(private unsubscribe: UnsubscribeService) {}
 * 
 *   ngOnInit() {
 *     // RxJS subscription
 *     const sub = this.userService.users$.subscribe(users => {
 *       console.log(users);
 *     });
 *     this.unsubscribe.add(sub);
 * 
 *     // Firebase listener
 *     const unsub = this.evaluationService.getEvaluations(...);
 *     this.unsubscribe.add(unsub);
 *   }
 * 
 *   // Non serve ngOnDestroy, tutto viene pulito automaticamente!
 * }
 * ```
 */
@Injectable()
export class UnsubscribeService implements OnDestroy {
    private subscriptions: (Subscription | (() => void))[] = [];

    /**
     * Aggiunge una subscription o unsubscribe function da gestire
     * 
     * @param subscription - RxJS Subscription o Firebase unsubscribe function
     * 
     * @example
     * ```typescript
     * // RxJS
     * const sub = this.service.getData().subscribe(...);
     * this.unsubscribe.add(sub);
     * 
     * // Firebase
     * const unsub = onSnapshot(query, (snapshot) => {...});
     * this.unsubscribe.add(unsub);
     * ```
     */
    add(subscription: Subscription | (() => void)): void {
        if (subscription) {
            this.subscriptions.push(subscription);
        }
    }

    /**
     * Chiamato automaticamente quando il componente viene distrutto
     * Esegue unsubscribe di tutte le subscription registrate
     */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            try {
                if (typeof sub === 'function') {
                    // Firebase unsubscribe function
                    sub();
                } else if (sub && typeof sub.unsubscribe === 'function') {
                    // RxJS Subscription
                    sub.unsubscribe();
                }
            } catch (error) {
                console.error('Error during unsubscribe:', error);
            }
        });
        this.subscriptions = [];
    }

    /**
     * Pulisce manualmente tutte le subscription
     * Utile se vuoi fare cleanup prima della distruzione del componente
     */
    clear(): void {
        this.ngOnDestroy();
    }

    /**
     * Restituisce il numero di subscription attive
     * Utile per debug
     */
    get count(): number {
        return this.subscriptions.length;
    }
}
