import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Evaluation2PdfComponent } from './evaluation2-pdf.component';

describe('Evaluation2PdfComponent', () => {
  let component: Evaluation2PdfComponent;
  let fixture: ComponentFixture<Evaluation2PdfComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Evaluation2PdfComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluation2PdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
