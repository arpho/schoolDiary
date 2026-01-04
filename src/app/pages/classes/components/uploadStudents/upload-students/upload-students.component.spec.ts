import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UploadStudentsComponent } from './upload-students.component';

describe('UploadStudentsComponent', () => {
  let component: UploadStudentsComponent;
  let fixture: ComponentFixture<UploadStudentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), UploadStudentsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
