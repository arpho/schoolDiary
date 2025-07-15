import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridsdialogPage } from './gridsdialog';

import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
const mockModalController = {};

describe('Gridsdialog', () => {
  let component: GridsdialogPage;
  let fixture: ComponentFixture<GridsdialogPage>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: ModalController, useValue: mockModalController },
      { provide: AuthService, useValue: {} },
      { provide: Auth, useValue: {} },
      { provide: Firestore, useValue: { collection: () => ({ valueChanges: () => ({ subscribe: () => {} }) }) } }
    ]
  });
    fixture = TestBed.createComponent(GridsdialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
