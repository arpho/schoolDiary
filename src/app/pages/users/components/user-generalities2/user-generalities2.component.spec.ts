import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserGeneralities2Component } from './user-generalities2.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { FormBuilder } from '@angular/forms';
import { UserModel } from 'src/app/shared/models/userModel';

import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
import { ClassesFieldComponent } from 'src/app/pages/classes/components/classes-field/classes-field.component';

@Component({
  selector: 'app-classes-field',
  template: '',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClassesFieldStubComponent),
      multi: true
    }
  ]
})
class ClassesFieldStubComponent implements ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Input() classes: AssignedClass[] = [];
  @Output() classeschange = new EventEmitter<AssignedClass[]>();

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}
}

describe('UserGeneralities2Component', () => {
  let component: UserGeneralities2Component;
  let fixture: ComponentFixture<UserGeneralities2Component>;

  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let classiServiceSpy: jasmine.SpyObj<ClassiService>;
  let toasterServiceSpy: jasmine.SpyObj<ToasterService>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser', 'updateUser', 'createUser', 'setUserClaims2user', 'getCustomClaims4LoggedUser']);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
    const toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), UserGeneralities2Component, ClassesFieldStubComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: ToasterService, useValue: toasterSpy },
        FormBuilder
      ]
    })
    .overrideComponent(UserGeneralities2Component, {
      remove: { imports: [ClassesFieldComponent] },
      add: { imports: [ClassesFieldStubComponent] }
    })
    .compileComponents();

    usersServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    classiServiceSpy = TestBed.inject(ClassiService) as jasmine.SpyObj<ClassiService>;
    toasterServiceSpy = TestBed.inject(ToasterService) as jasmine.SpyObj<ToasterService>;

    usersServiceSpy.getLoggedUser.and.returnValue(Promise.resolve(new UserModel()));

    fixture = TestBed.createComponent(UserGeneralities2Component);
    component = fixture.componentInstance;
    // Provide a required input signal if needed, or if it's set via template, ensure it's handled.
    // However, signal inputs are tricky to set directly on component instance before Angular 17.
    // Since it's a required input, we can try setting it via fixture.componentRef.setInput if available or use a wrapper.
    // For now, let's assume we can set it via the input signal if it's writable or check how it's used.
    // Actually, `user` is `input.required<UserModel>()`. We must set it.
    fixture.componentRef.setInput('user', new UserModel());
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
