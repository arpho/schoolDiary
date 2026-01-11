import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReservedNotes4ClassesComponent } from './reserved-notes4classes.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassReservedNotesService } from '../../services/classReservedNotes/class-reserved-notes.service';

describe('ReservedNotes4ClassesComponent', () => {
  let component: ReservedNotes4ClassesComponent;
  let fixture: ComponentFixture<ReservedNotes4ClassesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReservedNotes4ClassesComponent],
      providers: [
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser') } },
        { provide: ClassReservedNotesService, useValue: { /* mock methods if needed */ } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservedNotes4ClassesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('classe', { key: 'test-class' });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
