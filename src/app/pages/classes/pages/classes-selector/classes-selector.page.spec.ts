import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClassesSelectorPage } from './classes-selector.page';
import { ClassiService } from '../../services/classi.service';
import { of } from 'rxjs';

describe('ClassesSelectorPage', () => {
  let component: ClassesSelectorPage;
  let fixture: ComponentFixture<ClassesSelectorPage>;
  let classesServiceMock: any;

  beforeEach(waitForAsync(() => {
    classesServiceMock = {
      getClasses: jasmine.createSpy('getClasses').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ClassesSelectorPage],
      providers: [
        { provide: ClassiService, useValue: classesServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
