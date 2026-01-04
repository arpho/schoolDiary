import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentsWithPdPComponent } from './students-with-pd-p.component';

describe('StudentsWithPdPComponent', () => {
  let component: StudentsWithPdPComponent;
  let fixture: ComponentFixture<StudentsWithPdPComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), StudentsWithPdPComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsWithPdPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
