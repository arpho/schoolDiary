import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DashboardTeacherComponent } from './dashboard-teacher';

describe('DashboardTeacherComponent', () => {
  let component: DashboardTeacherComponent;
  let fixture: ComponentFixture<DashboardTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTeacherComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
