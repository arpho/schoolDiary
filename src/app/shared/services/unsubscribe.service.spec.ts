import { TestBed } from '@angular/core/testing';
import { Subscription, Subject } from 'rxjs';
import { UnsubscribeService } from './unsubscribe.service';

describe('UnsubscribeService', () => {
    let service: UnsubscribeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UnsubscribeService]
        });
        service = TestBed.inject(UnsubscribeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('add()', () => {
        it('should add RxJS subscription', () => {
            const subject = new Subject();
            const subscription = subject.subscribe();

            service.add(subscription);

            expect(service.count).toBe(1);
        });

        it('should add Firebase unsubscribe function', () => {
            const unsubscribe = jasmine.createSpy('unsubscribe');

            service.add(unsubscribe);

            expect(service.count).toBe(1);
        });

        it('should add multiple subscriptions', () => {
            const sub1 = new Subject().subscribe();
            const sub2 = new Subject().subscribe();
            const unsub = jasmine.createSpy('unsubscribe');

            service.add(sub1);
            service.add(sub2);
            service.add(unsub);

            expect(service.count).toBe(3);
        });

        it('should handle null/undefined gracefully', () => {
            service.add(null as any);
            service.add(undefined as any);

            expect(service.count).toBe(0);
        });
    });

    describe('ngOnDestroy()', () => {
        it('should unsubscribe RxJS subscriptions', () => {
            const subject = new Subject();
            const subscription = subject.subscribe();
            spyOn(subscription, 'unsubscribe');

            service.add(subscription);
            service.ngOnDestroy();

            expect(subscription.unsubscribe).toHaveBeenCalled();
        });

        it('should call Firebase unsubscribe functions', () => {
            const unsubscribe = jasmine.createSpy('unsubscribe');

            service.add(unsubscribe);
            service.ngOnDestroy();

            expect(unsubscribe).toHaveBeenCalled();
        });

        it('should handle mixed subscriptions', () => {
            const subject = new Subject();
            const subscription = subject.subscribe();
            const unsubscribe = jasmine.createSpy('unsubscribe');
            spyOn(subscription, 'unsubscribe');

            service.add(subscription);
            service.add(unsubscribe);
            service.ngOnDestroy();

            expect(subscription.unsubscribe).toHaveBeenCalled();
            expect(unsubscribe).toHaveBeenCalled();
        });

        it('should clear all subscriptions after destroy', () => {
            const sub1 = new Subject().subscribe();
            const sub2 = new Subject().subscribe();

            service.add(sub1);
            service.add(sub2);
            expect(service.count).toBe(2);

            service.ngOnDestroy();

            expect(service.count).toBe(0);
        });

        it('should handle errors during unsubscribe gracefully', () => {
            const badSubscription = {
                unsubscribe: () => {
                    throw new Error('Unsubscribe error');
                }
            } as Subscription;

            service.add(badSubscription);

            // Should not throw
            expect(() => service.ngOnDestroy()).not.toThrow();
        });
    });

    describe('clear()', () => {
        it('should clear all subscriptions manually', () => {
            const sub1 = new Subject().subscribe();
            const sub2 = new Subject().subscribe();
            spyOn(sub1, 'unsubscribe');
            spyOn(sub2, 'unsubscribe');

            service.add(sub1);
            service.add(sub2);
            service.clear();

            expect(sub1.unsubscribe).toHaveBeenCalled();
            expect(sub2.unsubscribe).toHaveBeenCalled();
            expect(service.count).toBe(0);
        });
    });

    describe('count', () => {
        it('should return 0 initially', () => {
            expect(service.count).toBe(0);
        });

        it('should return correct count after adding subscriptions', () => {
            service.add(new Subject().subscribe());
            expect(service.count).toBe(1);

            service.add(new Subject().subscribe());
            expect(service.count).toBe(2);

            service.add(jasmine.createSpy('unsubscribe'));
            expect(service.count).toBe(3);
        });

        it('should return 0 after clear', () => {
            service.add(new Subject().subscribe());
            service.add(new Subject().subscribe());

            service.clear();

            expect(service.count).toBe(0);
        });
    });

    describe('Integration tests', () => {
        it('should work with real Observable subscription', (done) => {
            const subject = new Subject<number>();
            let receivedValue: number | undefined;

            const subscription = subject.subscribe(value => {
                receivedValue = value;
            });

            service.add(subscription);

            subject.next(42);
            expect(receivedValue).toBe(42);

            service.ngOnDestroy();

            // After destroy, subscription should not receive values
            receivedValue = undefined;
            subject.next(99);
            expect(receivedValue).toBeUndefined();

            done();
        });

        it('should work with multiple subscriptions to same Observable', () => {
            const subject = new Subject<string>();
            const values1: string[] = [];
            const values2: string[] = [];

            const sub1 = subject.subscribe(v => values1.push(v));
            const sub2 = subject.subscribe(v => values2.push(v));

            service.add(sub1);
            service.add(sub2);

            subject.next('test');
            expect(values1).toEqual(['test']);
            expect(values2).toEqual(['test']);

            service.ngOnDestroy();

            subject.next('after destroy');
            expect(values1).toEqual(['test']); // Should not receive new value
            expect(values2).toEqual(['test']); // Should not receive new value
        });
    });
});
