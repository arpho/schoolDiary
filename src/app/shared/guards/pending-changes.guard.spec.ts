import { TestBed } from '@angular/core/testing';
import { pendingChangesGuard, HasUnsavedChanges } from './pending-changes.guard';
import { AlertController } from '@ionic/angular/standalone';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('pendingChangesGuard', () => {
  let alertControllerMock: jasmine.SpyObj<AlertController>;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    alertControllerMock = jasmine.createSpyObj('AlertController', ['create']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: AlertController, useValue: alertControllerMock }
      ]
    });

    injector = TestBed.inject(EnvironmentInjector);
  });

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;
  const mockNextState = {} as RouterStateSnapshot;

  it('should allow navigation if the component does not implement hasUnsavedChanges', async () => {
    const component = {} as any;
    const result = await runInInjectionContext(injector, () => 
      pendingChangesGuard(component, mockRoute, mockState, mockNextState)
    );
    expect(result).toBe(true);
  });

  it('should allow navigation if hasUnsavedChanges returns false', async () => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => false
    };
    const result = await runInInjectionContext(injector, () => 
      pendingChangesGuard(component, mockRoute, mockState, mockNextState)
    );
    expect(result).toBe(true);
  });

  it('should block navigation if hasUnsavedChanges returns true and user cancels the alert', async () => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true
    };

    const alertMock = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertMock.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    alertControllerMock.create.and.returnValue(Promise.resolve(alertMock));

    const result = await runInInjectionContext(injector, () => 
      pendingChangesGuard(component, mockRoute, mockState, mockNextState)
    );

    expect(alertControllerMock.create).toHaveBeenCalled();
    expect(alertMock.present).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should allow navigation if hasUnsavedChanges returns true and user confirms (destructive role)', async () => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true
    };

    const alertMock = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertMock.onDidDismiss.and.returnValue(Promise.resolve({ role: 'destructive' }));
    alertControllerMock.create.and.returnValue(Promise.resolve(alertMock));

    const result = await runInInjectionContext(injector, () => 
      pendingChangesGuard(component, mockRoute, mockState, mockNextState)
    );

    expect(result).toBe(true);
  });

  it('should pass correct configuration to AlertController', async () => {
    const component: HasUnsavedChanges = {
      hasUnsavedChanges: () => true
    };

    const alertMock = jasmine.createSpyObj('HTMLIonAlertElement', ['present', 'onDidDismiss']);
    alertMock.onDidDismiss.and.returnValue(Promise.resolve({ role: 'cancel' }));
    alertControllerMock.create.and.returnValue(Promise.resolve(alertMock));

    await runInInjectionContext(injector, () => 
      pendingChangesGuard(component, mockRoute, mockState, mockNextState)
    );

    const callArgs = alertControllerMock.create.calls.mostRecent().args[0]!;
    expect(callArgs.header).toBe('Modifiche non salvate');
    expect(callArgs.buttons?.length).toBe(2);
    // @ts-ignore
    expect(callArgs.buttons[1].role).toBe('destructive');
  });
});
