import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EvaluateGridComponent } from './evaluate-grid.component';

describe('EvaluateGridComponent', () => {
  let component: EvaluateGridComponent;
  let fixture: ComponentFixture<EvaluateGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), EvaluateGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluateGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
