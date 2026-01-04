import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GroupViewerComponent } from './group-viewer.component';

describe('GroupViewerComponent', () => {
  let component: GroupViewerComponent;
  let fixture: ComponentFixture<GroupViewerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), GroupViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
