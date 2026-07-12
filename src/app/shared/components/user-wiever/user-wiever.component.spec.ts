import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserWieverComponent } from './user-wiever.component';

import { UsersService } from 'src/app/shared/services/users.service';

describe('UserWieverComponent', () => {
  let component: UserWieverComponent;
  let fixture: ComponentFixture<UserWieverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), UserWieverComponent],
      providers: [
        { provide: UsersService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserWieverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
