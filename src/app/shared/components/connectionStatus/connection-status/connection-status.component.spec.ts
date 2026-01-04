import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConnectionStatusComponent } from './connection-status.component';

import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';

describe('ConnectionStatusComponent', () => {
  let component: ConnectionStatusComponent;
  let fixture: ComponentFixture<ConnectionStatusComponent>;

  beforeEach(waitForAsync(() => {
    addIcons({ wifi, 'wifi-outline': wifiOutline });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ConnectionStatusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectionStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
