import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Evaluation2PdfComponent } from './evaluation2-pdf.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';

describe('Evaluation2PdfComponent', () => {
  let component: Evaluation2PdfComponent;
  let fixture: ComponentFixture<Evaluation2PdfComponent>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['fetchUserOnCache']);
    const evaluationSpy = jasmine.createSpyObj('EvaluationService', ['fetchEvaluation']);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: () => 'eval-123' } },
      paramMap: of({ get: () => 'eval-123' })
    };

    evaluationSpy.fetchEvaluation.and.returnValue(Promise.resolve(new Evaluation()));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), Evaluation2PdfComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: EvaluationService, useValue: evaluationSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluation2PdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
