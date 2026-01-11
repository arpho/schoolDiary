import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
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
      imports: [EventDialogComponent],
      providers: [
        provideIonicAngular(),
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
