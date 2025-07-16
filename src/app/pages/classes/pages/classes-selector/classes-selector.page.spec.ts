import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassesSelectorPage } from './classes-selector.page';

describe('ClassesSelectorPage', () => {
  let component: ClassesSelectorPage;
  let fixture: ComponentFixture<ClassesSelectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassesSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
