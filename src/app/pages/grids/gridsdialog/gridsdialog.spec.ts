import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GridsdialogPage } from './gridsdialog';

import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

describe('GridsdialogPage', () => {
  let component: GridsdialogPage;
  let fixture: ComponentFixture<GridsdialogPage>;
  let modalControllerMock: any;

  beforeEach(waitForAsync(() => {
    modalControllerMock = {
      dismiss: jasmine.createSpy('dismiss')
    };

    TestBed.configureTestingModule({
      imports: [GridsdialogPage],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: AuthService, useValue: { getUser: jasmine.createSpy('getUser').and.returnValue({ uid: 'test-uid' }) } },
        { provide: Auth, useValue: {} },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GridsdialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
