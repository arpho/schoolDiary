import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClassViewerComponent } from './class-viewer.component';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ClassiService } from '../../services/classi.service';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

describe('ClassViewerComponent', () => {
  let component: ClassViewerComponent;
  let fixture: ComponentFixture<ClassViewerComponent>;

  beforeEach(waitForAsync(() => {
    const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
    const subjectSpy = jasmine.createSpyObj('SubjectService', ['getSubjects', 'fetchSubjectListOnRealTime']);
    subjectSpy.getSubjects.and.returnValue(of([]));
    subjectSpy.fetchSubjectListOnRealTime.and.returnValue(of([]));
    
    // We mock Firestore to be safe, although mocking ClassiService should theoretically remove the need for it.
    // The fact that we previously saw NG0201 path ClassiService -> Firestore suggests the real ClassiService was somehow being used.
    // We provide a dummy Firestore mock.
    const firestoreMock = {};

    TestBed.configureTestingModule({
      imports: [ClassViewerComponent],
      providers: [
        provideIonicAngular(),
        { provide: ClassiService, useValue: classiSpy },
        { provide: SubjectService, useValue: subjectSpy },
        { provide: Firestore, useValue: firestoreMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
