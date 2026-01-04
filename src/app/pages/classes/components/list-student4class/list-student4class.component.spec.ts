import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListStudent4classComponent } from './list-student4class.component';

describe('ListStudent4classComponent', () => {
  let component: ListStudent4classComponent;
  let fixture: ComponentFixture<ListStudent4classComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ListStudent4classComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ListStudent4classComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
