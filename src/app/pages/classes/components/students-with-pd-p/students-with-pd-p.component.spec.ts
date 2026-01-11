import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { UsersService } from 'src/app/shared/services/users.service';
import { StudentsWithPdPComponent } from './students-with-pd-p.component';

describe('StudentsWithPdPComponent', () => {
  let component: StudentsWithPdPComponent;
  let fixture: ComponentFixture<StudentsWithPdPComponent>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getUsersOnRealTime']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), StudentsWithPdPComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsWithPdPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
