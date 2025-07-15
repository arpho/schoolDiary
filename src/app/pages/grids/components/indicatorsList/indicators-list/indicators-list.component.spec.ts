import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Firestore } from '@angular/fire/firestore';

import { IndicatorsListComponent } from './indicators-list.component';

describe('IndicatorsListComponent', () => {
  let component: IndicatorsListComponent;
  let fixture: ComponentFixture<IndicatorsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IndicatorsListComponent, IonicModule.forRoot()],
      providers: [{ provide: Firestore, useValue: { collection: () => ({ valueChanges: () => ({ subscribe: () => {} }) }) } }]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
