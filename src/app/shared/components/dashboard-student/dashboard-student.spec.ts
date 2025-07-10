import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardStudent } from './dashboard-student';
import { By } from '@angular/platform-browser';

describe('DashboardStudent', () => {
  let component: DashboardStudent;
  let fixture: ComponentFixture<DashboardStudent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStudent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardStudent);
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
