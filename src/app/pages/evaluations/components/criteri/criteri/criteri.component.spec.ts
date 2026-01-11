import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CriteriComponent } from './criteri.component';

describe('CriteriComponent', () => {
  let component: CriteriComponent;
  let fixture: ComponentFixture<CriteriComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CriteriComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CriteriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
