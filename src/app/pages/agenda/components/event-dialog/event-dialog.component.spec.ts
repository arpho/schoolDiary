import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { EventDialogComponent } from './event-dialog.component';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';

describe('EventDialogComponent', () => {
  let component: EventDialogComponent;
  let fixture: ComponentFixture<EventDialogComponent>;

  const agendaServiceMock = {
    addEvent: jasmine.createSpy('addEvent'),
    updateEvent: jasmine.createSpy('updateEvent')
  };

  const toasterServiceMock = {
    showToast: jasmine.createSpy('showToast')
  };

  const modalCtrlMock = {
    dismiss: jasmine.createSpy('dismiss')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), EventDialogComponent],
      providers: [
        { provide: AgendaService, useValue: agendaServiceMock },
        { provide: ToasterService, useValue: toasterServiceMock },
        { provide: ModalController, useValue: modalCtrlMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
