import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IndicatorViewerComponent } from './indicator-viewer.component';

describe('IndicatorViewerComponent', () => {
  let component: IndicatorViewerComponent;
  let fixture: ComponentFixture<IndicatorViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorViewerComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatorViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
