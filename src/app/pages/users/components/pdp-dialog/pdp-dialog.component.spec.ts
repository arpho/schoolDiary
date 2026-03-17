import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PdpDialogComponent } from './pdp-dialog.component';

describe('PdpDialogComponent', () => {
  let component: PdpDialogComponent;
  let fixture: ComponentFixture<PdpDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PdpDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
