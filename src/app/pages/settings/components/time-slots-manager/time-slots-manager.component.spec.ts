import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSlotsManagerComponent } from './time-slots-manager.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';

describe('TimeSlotsManagerComponent', () => {
  let component: TimeSlotsManagerComponent;
  let fixture: ComponentFixture<TimeSlotsManagerComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let toasterSpy: jasmine.SpyObj<ToasterService>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser', 'updateUser']);
    toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);

    usersServiceSpy.getLoggedUser.and.returnValue(Promise.resolve({
      key: 'user-id',
      schoolTimeSlots: []
    } as any));

    await TestBed.configureTestingModule({
      imports: [TimeSlotsManagerComponent],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: ToasterService, useValue: toasterSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSlotsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default slots if empty', async () => {
    await fixture.whenStable();
    expect(component.slots().length).toBeGreaterThan(0);
    expect(component.slots()[0].name).toEqual('1° Ora');
  });

  it('should add a slot', async () => {
    await fixture.whenStable();
    const initialLength = component.slots().length;
    component.addSlot();
    expect(component.slots().length).toBe(initialLength + 1);
  });

  it('should remove a slot', async () => {
    await fixture.whenStable();
    const initialLength = component.slots().length;
    component.removeSlot(0);
    expect(component.slots().length).toBe(initialLength - 1);
  });
});
