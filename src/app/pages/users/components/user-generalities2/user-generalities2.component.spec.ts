import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserGeneralities2Component } from './user-generalities2.component';

describe('UserGeneralities2Component', () => {
  let component: UserGeneralities2Component;
  let fixture: ComponentFixture<UserGeneralities2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), UserGeneralities2Component]
    }).compileComponents();

    fixture = TestBed.createComponent(UserGeneralities2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
