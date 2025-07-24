import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReservedNotes4classesComponent } from './reserved-notes4classes.component';

describe('ReservedNotes4classesComponent', () => {
  let component: ReservedNotes4classesComponent;
  let fixture: ComponentFixture<ReservedNotes4classesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservedNotes4classesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservedNotes4classesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
