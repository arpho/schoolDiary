import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutoringPage } from './tutoring.page';

describe('TutoringPage', () => {
  let component: TutoringPage;
  let fixture: ComponentFixture<TutoringPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TutoringPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
