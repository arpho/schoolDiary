import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaSchedulerToastUiComponent } from './agenda-scheduler-toast-ui.component';
import { AgendaEvent } from '../../models/agendaEvent';

describe('AgendaSchedulerToastUiComponent', () => {
  let component: AgendaSchedulerToastUiComponent;
  let fixture: ComponentFixture<AgendaSchedulerToastUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaSchedulerToastUiComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaSchedulerToastUiComponent);
    component = fixture.componentInstance;
    
    // Provide required input
    fixture.componentRef.setInput('events', []);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getEventColor', () => {
    // Access private method for testing using any cast
    const getColor = (type: string) => (component as any).getEventColor(type);

    it('should return primary color for homework', () => {
      expect(getColor('homework')).toBe('var(--ion-color-primary)');
    });

    it('should return danger color for test', () => {
      expect(getColor('test')).toBe('var(--ion-color-danger)');
    });

    it('should return warning color for meeting', () => {
      expect(getColor('meeting')).toBe('var(--ion-color-warning)');
    });

    it('should return tertiary color for interrogation', () => {
      expect(getColor('interrogation')).toBe('var(--ion-color-tertiary)');
    });

    it('should return success color for note', () => {
      expect(getColor('note')).toBe('var(--ion-color-success)');
    });

    it('should return medium color for other', () => {
      expect(getColor('other')).toBe('var(--ion-color-medium)');
    });

    it('should return medium color for unknown types', () => {
      expect(getColor('unknown')).toBe('var(--ion-color-medium)');
    });
  });
});
