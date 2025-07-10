import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gridsdialog } from './gridsdialog';

describe('Gridsdialog', () => {
  let component: Gridsdialog;
  let fixture: ComponentFixture<Gridsdialog>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Gridsdialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
