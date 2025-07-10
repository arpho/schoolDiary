import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardAdmin } from './dashboard-admin';
import { By } from '@angular/platform-browser';

describe('DashboardAdminComponent', () => {
  let component: DashboardAdmin;
  let fixture: ComponentFixture<DashboardAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdmin]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dashboard admin title', () => {
    const title = fixture.debugElement.query(By.css('h2'));
    expect(title.nativeElement.textContent).toContain('Dashboard Amministratore');
  });
});
