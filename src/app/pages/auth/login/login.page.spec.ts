import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { Firestore } from '@angular/fire/firestore';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { IonicModule } from '@ionic/angular';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  const toasterServiceMock = {
    presentToast: jasmine.createSpy('presentToast')
  };

  const angularFireAuthMock = {
    signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword').and.returnValue(Promise.resolve({ user: { uid: '123' } }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LoginPage],
      providers: [
        { provide: AngularFireAuth, useValue: angularFireAuthMock },
        { provide: ToasterService, useValue: toasterServiceMock },
        provideRouter([]), // Use real router provider
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: FIREBASE_OPTIONS, useValue: { apiKey: 'test' } },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
