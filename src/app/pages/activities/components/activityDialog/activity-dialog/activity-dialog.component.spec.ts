import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActivityDialogComponent } from './activity-dialog.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ModalController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

describe('ActivityDialogComponent', () => {
  let component: ActivityDialogComponent;
  let fixture: ComponentFixture<ActivityDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivityDialogComponent],
      providers: [
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser') } },
        { provide: ModalController, useValue: { dismiss: jasmine.createSpy('dismiss') } },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
