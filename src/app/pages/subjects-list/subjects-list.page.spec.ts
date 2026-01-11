import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SubjectsListPage } from './subjects-list.page';
import { IonicModule } from '@ionic/angular';
import { SubjectService } from './services/subjects/subject.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';
import { of } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';

describe('SubjectsListPage', () => {
  let component: SubjectsListPage;
  let fixture: ComponentFixture<SubjectsListPage>;

  const subjectServiceMock = {
    fetchSubjectListOnRealTime: jasmine.createSpy('fetchSubjectListOnRealTime').and.returnValue({
      unsubscribe: () => {}
    })
  };

  const toasterServiceMock = {
    showToast: jasmine.createSpy('showToast')
  };

  const modalControllerMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
      present: () => Promise.resolve(),
      onDidDismiss: () => Promise.resolve({ data: null })
    })),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), SubjectsListPage],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: SubjectService, useValue: subjectServiceMock },
        { provide: ToasterService, useValue: toasterServiceMock },
        UnsubscribeService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
