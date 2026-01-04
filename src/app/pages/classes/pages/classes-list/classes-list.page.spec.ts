import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesListPage } from './classes-list.page';

describe('ClassesListPage', () => {
  let component: ClassesListPage;
  let fixture: ComponentFixture<ClassesListPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClassesListPage]
    });
    fixture = TestBed.createComponent(ClassesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
