import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridsdialogPage } from './gridsdialog';

describe('Gridsdialog', () => {
  let component: GridsdialogPage;
  let fixture: ComponentFixture<GridsdialogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GridsdialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
