import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { CreateSubjectPage } from './create-subject.page';

describe('CreateSubjectPage', () => {
  let component: CreateSubjectPage;
  let fixture: ComponentFixture<CreateSubjectPage>;

  beforeEach(async () => {
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CreateSubjectPage],
      providers: [
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSubjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
