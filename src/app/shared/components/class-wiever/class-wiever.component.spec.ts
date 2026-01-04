import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClassViewerComponent } from './class-wiever.component';

describe('ClassViewerComponent', () => {
  let component: ClassViewerComponent;
  let fixture: ComponentFixture<ClassViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ClassViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
