import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridsListComponent } from './grids-list';

import { ModalController, NavController } from '@ionic/angular';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
const mockModalController = {};

describe('GridsListPage', () => {
  let component: GridsListComponent;
  let fixture: ComponentFixture<GridsListComponent>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: ModalController, useValue: mockModalController },
      { provide: GridsService, useValue: { getGridsOnRealtime: jasmine.createSpy('getGridsOnRealtime') } },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      { provide: NavController, useValue: jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot', 'back']) }
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
