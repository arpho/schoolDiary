import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular, AlertController, ModalController } from '@ionic/angular/standalone';
import { UsersService } from 'src/app/shared/services/users.service';

import { UploadStudentsComponent } from './upload-students.component';

describe('UploadStudentsComponent', () => {
  let component: UploadStudentsComponent;
  let fixture: ComponentFixture<UploadStudentsComponent>;

  beforeEach(async () => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['createUser']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [UploadStudentsComponent],
      providers: [
        provideIonicAngular(),
        { provide: UsersService, useValue: usersSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('emailFactory', () => {
    it('should generate standard email correctly', () => {
      const alunno = { firstName: 'Mario', lastName: 'Rossi' } as any;
      const email = component.emailFactory(alunno);
      expect(email).toBe('mario.rossi.studenti@iiscuriesraffa.it');
    });

    it('should remove accents', () => {
      const alunno = { firstName: 'Nicolò', lastName: 'D\'Amico' } as any;
      const email = component.emailFactory(alunno);
      expect(email).toBe('nicolo.damico.studenti@iiscuriesraffa.it');
    });

    it('should remove spaces and non-alphanumeric characters', () => {
      const alunno = { firstName: 'Maria  Luisa', lastName: 'De  Luca-Jones' } as any;
      const email = component.emailFactory(alunno);
      expect(email).toBe('marialuisa.delucajones.studenti@iiscuriesraffa.it');
    });

    it('should handle uppercase letters', () => {
      const alunno = { firstName: 'GIUSEPPE', lastName: 'VERDI' } as any;
      const email = component.emailFactory(alunno);
      expect(email).toBe('giuseppe.verdi.studenti@iiscuriesraffa.it');
    });
  });
});
