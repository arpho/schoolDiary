import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FilterPopupComponent } from './filter-popup.component';

describe('FilterPopupComponent', () => {
  let component: FilterPopupComponent;
  let fixture: ComponentFixture<FilterPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FilterPopupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
