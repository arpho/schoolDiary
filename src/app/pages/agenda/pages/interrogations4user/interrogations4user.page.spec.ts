import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Interrogations4userPage } from './interrogations4user.page';

describe('Interrogations4userPage', () => {
  let component: Interrogations4userPage;
  let fixture: ComponentFixture<Interrogations4userPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Interrogations4userPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
