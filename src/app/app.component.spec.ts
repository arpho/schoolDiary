import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { Auth } from '@angular/fire/auth';
import { ClassiService } from './pages/classes/services/classi.service';
import { UsersService } from './shared/services/users.service';
import { ActivitiesService } from './pages/activities/services/activities.service';
import { Messaging } from '@angular/fire/messaging';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: { onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.returnValue(() => { }) } },
        { provide: ClassiService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: ActivitiesService, useValue: {} },
        { provide: Messaging, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
