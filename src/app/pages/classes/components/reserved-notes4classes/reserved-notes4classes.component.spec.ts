import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReservedNotes4ClassesComponent } from './reserved-notes4classes.component';

describe('ReservedNotes4ClassesComponent', () => {
  let component: ReservedNotes4ClassesComponent;
  let fixture: ComponentFixture<ReservedNotes4ClassesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservedNotes4ClassesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservedNotes4ClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
