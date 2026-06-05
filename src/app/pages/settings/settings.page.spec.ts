import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPage } from './settings.page';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { NavController, provideIonicAngular } from '@ionic/angular/standalone';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockUsersService: any;

  beforeEach(async () => {
    mockThemeService = jasmine.createSpyObj('ThemeService', ['setTheme'], {
      currentTheme: signal('system')
    });
    
    mockUsersService = jasmine.createSpyObj('UsersService', ['getLoggedUser']);
    mockUsersService.getLoggedUser.and.returnValue(Promise.resolve({}));

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: NavController, useValue: jasmine.createSpyObj('NavController', ['navigateBack']) },
        provideIonicAngular()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get current theme from service', () => {
    expect(component.currentTheme).toBe('system');
  });

  it('should call setTheme on change', () => {
    const event = { detail: { value: 'dark' } };
    component.onThemeChange(event);
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('dark');
  });
});
