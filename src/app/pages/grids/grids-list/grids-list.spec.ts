import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridsListComponent } from './grids-list';

describe('GridsListPage', () => {
  let component: GridsListComponent;
  let fixture: ComponentFixture<GridsListComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GridsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
