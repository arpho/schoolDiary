import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConnectionStatusComponent } from './connection-status.component';

import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';

describe('ConnectionStatusComponent', () => {
  let component: ConnectionStatusComponent;
  let fixture: ComponentFixture<ConnectionStatusComponent>;

  beforeEach(async () => {
    addIcons({ wifi, 'wifi-outline': wifiOutline });
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ConnectionStatusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
