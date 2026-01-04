import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditEvaluationPage } from './edit-evaluation.page';

import { provideRouter } from '@angular/router';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';

describe('EditEvaluationPage', () => {
  let component: EditEvaluationPage;
  let fixture: ComponentFixture<EditEvaluationPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditEvaluationPage],
      providers: [
        provideRouter([]),
        { provide: ClassiService, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(EditEvaluationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
