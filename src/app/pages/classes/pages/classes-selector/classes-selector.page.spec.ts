import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClassesSelectorPage } from './classes-selector.page';
import { ClassiService } from '../../services/classi.service';
import { of } from 'rxjs';
import { ModalController } from '@ionic/angular';

describe('ClassesSelectorPage', () => {
  let component: ClassesSelectorPage;
  let fixture: ComponentFixture<ClassesSelectorPage>;
  let classesServiceMock: any;

  beforeEach(waitForAsync(() => {
    classesServiceMock = {
      getClasses: jasmine.createSpy('getClasses').and.returnValue(of([])),
      getClassiOnRealtime: jasmine.createSpy('getClassiOnRealtime').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [ClassesSelectorPage],
      providers: [
        { provide: ClassiService, useValue: classesServiceMock },
        { provide: ModalController, useValue: { dismiss: jasmine.createSpy('dismiss') } }
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
