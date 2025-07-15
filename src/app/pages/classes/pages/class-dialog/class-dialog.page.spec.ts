import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassDialogPage } from './class-dialog.page';

describe('ClassDialogPage', () => {
  let component: ClassDialogPage;
  let fixture: ComponentFixture<ClassDialogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
