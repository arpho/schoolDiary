import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangelogPage } from './changelog.page';

describe('ChangelogPage', () => {
  let component: ChangelogPage;
  let fixture: ComponentFixture<ChangelogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangelogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
