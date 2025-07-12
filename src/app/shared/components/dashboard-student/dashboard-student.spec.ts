import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardStudentComponent } from './dashboard-student';
import { By } from '@angular/platform-browser';

describe('DashboardStudentComponent', () => {
  let component: DashboardStudentComponent;
  let fixture: ComponentFixture<DashboardStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStudentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard student title', () => {
    const title = fixture.debugElement.query(By.css('h2'));
    expect(title.nativeElement.textContent).toContain('Dashboard Studente');
  });
});
