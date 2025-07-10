import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridsList } from './grids-list';

describe('GridsListPage', () => {
  let component: GridsList;
  let fixture: ComponentFixture<GridsList>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GridsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
