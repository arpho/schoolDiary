import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReservedNotes4studentComponent } from './reserved-notes4student.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ReservedNotes4studentsService } from '../../services/reservedNotes4Students/reserved-notes4students.service';

describe('ReservedNotes4studentComponent', () => {
  let component: ReservedNotes4studentComponent;
  let fixture: ComponentFixture<ReservedNotes4studentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReservedNotes4studentComponent],
      providers: [
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser') } },
        { provide: ReservedNotes4studentsService, useValue: { getNotesByStudentAndOwner: jasmine.createSpy('getNotesByStudentAndOwner').and.returnValue(Promise.resolve([])), getNotesOnRealtime: jasmine.createSpy('getNotesOnRealtime') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservedNotes4studentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
