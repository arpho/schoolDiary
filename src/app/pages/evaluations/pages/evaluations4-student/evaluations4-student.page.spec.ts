import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Evaluations4StudentPage } from './evaluations4-student.page';

describe('Evaluations4StudentPage', () => {
  let component: Evaluations4StudentPage;
  let fixture: ComponentFixture<Evaluations4StudentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Evaluations4StudentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
