import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridsListComponent } from './grids-list';

import { ModalController } from '@ionic/angular';
import { Firestore } from '@angular/fire/firestore';
const mockModalController = {};

describe('GridsListPage', () => {
  let component: GridsListComponent;
  let fixture: ComponentFixture<GridsListComponent>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: ModalController, useValue: mockModalController },
      { provide: Firestore, useValue: {
        collection: (...args: any[]) => ({ valueChanges: () => ({ subscribe: () => {} }) }),
        doc: (...args: any[]) => ({ valueChanges: () => ({ subscribe: () => {} }) })
      } }
    ]
  });
    fixture = TestBed.createComponent(GridsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
