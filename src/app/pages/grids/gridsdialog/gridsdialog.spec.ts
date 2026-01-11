import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GridsdialogPage } from './gridsdialog';

import { ModalController, ActionSheetController } from '@ionic/angular';
import { UsersService } from 'src/app/shared/services/users.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { provideRouter } from '@angular/router';
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
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser') } },
        { provide: GridsService, useValue: { updateGrid: jasmine.createSpy('updateGrid'), addGrid: jasmine.createSpy('addGrid'), fetchGrid: jasmine.createSpy('fetchGrid') } },
        { provide: ActionSheetController, useValue: jasmine.createSpyObj('ActionSheetController', ['create']) },
        { provide: ToasterService, useValue: jasmine.createSpyObj('ToasterService', ['showToast']) },
        provideRouter([]),
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
