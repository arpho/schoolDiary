import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassViewerComponent } from './class-wiever.component';
import { ClassiService } from '../../../pages/classes/services/classi.service';

describe('ClassViewerComponent', () => {
  let component: ClassViewerComponent;
  let fixture: ComponentFixture<ClassViewerComponent>;

  const classiServiceMock = {
    fetchClasseOnCache: jasmine.createSpy('fetchClasseOnCache').and.returnValue(Promise.resolve({})),
    // Add other methods if needed by the component's constructor or lifecycle hooks
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ClassViewerComponent],
      providers: [
        { provide: ClassiService, useValue: classiServiceMock }
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
