import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDialogPage } from './user-dialog.page';

describe('UserDialogPage', () => {
  let component: UserDialogPage;
  let fixture: ComponentFixture<UserDialogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
