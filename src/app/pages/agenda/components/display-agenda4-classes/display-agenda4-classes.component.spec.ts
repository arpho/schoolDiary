import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DisplayAgenda4ClassesComponent } from './display-agenda4-classes.component';

describe('DisplayAgenda4ClassesComponent', () => {
  let component: DisplayAgenda4ClassesComponent;
  let fixture: ComponentFixture<DisplayAgenda4ClassesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayAgenda4ClassesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayAgenda4ClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
