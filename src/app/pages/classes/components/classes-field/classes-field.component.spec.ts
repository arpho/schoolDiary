import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

import { ClassesFieldComponent } from './classes-field.component';
import { ClassiService } from '../../services/classi.service';
import { of } from 'rxjs';

describe('ClassesFieldComponent', () => {
  let component: ClassesFieldComponent;
  let fixture: ComponentFixture<ClassesFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ClassesFieldComponent, IonicModule.forRoot()],
      providers: [
        { provide: ClassiService, useValue: { getClassiOnRealtime: jasmine.createSpy('getClassiOnRealtime').and.returnValue(of([])) } },
        { provide: ModalController, useValue: { dismiss: jasmine.createSpy('dismiss') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
