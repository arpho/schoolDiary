import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentScheduledInterrogationComponent } from './student-scheduled-interrogation.component';
import { UserModel } from 'src/app/shared/models/userModel';
import { AgendaEvent } from 'src/app/pages/agenda/models/agendaEvent';
import { ComponentRef } from '@angular/core';

describe('StudentScheduledInterrogationComponent', () => {
  let component: StudentScheduledInterrogationComponent;
  let componentRef: ComponentRef<StudentScheduledInterrogationComponent>;
  let fixture: ComponentFixture<StudentScheduledInterrogationComponent>;
  let student: UserModel;
  let now: Date;
  let futureDate: Date;
  let farFutureDate: Date;
  let pastDate: Date;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentScheduledInterrogationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentScheduledInterrogationComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    // Configura date di test
    now = new Date();
    now.setHours(0, 0, 0, 0);
    
    futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 2);
    
    farFutureDate = new Date(now);
    farFutureDate.setDate(now.getDate() + 5);
    
    pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 2);

    student = new UserModel();
    student.key = 'student123';
    student.firstName = 'Mario';
    student.lastName = 'Rossi';
    
    componentRef.setInput('student', student);
    componentRef.setInput('events', []);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return null if there are no events', () => {
    expect(component.nextInterrogation()).toBeNull();
  });

  it('should return null if there are events but no interrogations', () => {
    const events = [
      new AgendaEvent({ type: 'homework', dataInizio: futureDate.toISOString() })
    ];
    componentRef.setInput('events', events);
    fixture.detectChanges();
    
    expect(component.nextInterrogation()).toBeNull();
  });

  it('should return null if interrogation is in the past', () => {
    const events = [
      new AgendaEvent({ 
        type: 'interrogation', 
        dataInizio: pastDate.toISOString(),
        targetStudents: ['student123']
      })
    ];
    componentRef.setInput('events', events);
    fixture.detectChanges();
    
    expect(component.nextInterrogation()).toBeNull();
  });

  it('should return event based on targetStudents (Structured Option 2)', () => {
    const event = new AgendaEvent({ 
      type: 'interrogation', 
      dataInizio: futureDate.toISOString(),
      targetStudents: ['student123', 'otherStudent']
    });
    componentRef.setInput('events', [event]);
    fixture.detectChanges();
    
    expect(component.nextInterrogation()).toEqual(event);
  });

  it('should return event based on lastName in title (Retrocompatible Option 1)', () => {
    const event = new AgendaEvent({ 
      type: 'interrogation', 
      title: 'Interrogazione di Rossi e Bianchi',
      dataInizio: futureDate.toISOString()
    });
    componentRef.setInput('events', [event]);
    fixture.detectChanges();
    
    expect(component.nextInterrogation()).toEqual(event);
  });

  it('should return null if title does not contain lastName and targetStudents does not match', () => {
    const event = new AgendaEvent({ 
      type: 'interrogation', 
      title: 'Interrogazione di Bianchi e Verdi',
      dataInizio: futureDate.toISOString(),
      targetStudents: ['otherStudent']
    });
    componentRef.setInput('events', [event]);
    fixture.detectChanges();
    
    expect(component.nextInterrogation()).toBeNull();
  });

  it('should return the closest future interrogation if multiple exist', () => {
    const eventFar = new AgendaEvent({ 
      type: 'interrogation', 
      dataInizio: farFutureDate.toISOString(),
      targetStudents: ['student123']
    });
    const eventClose = new AgendaEvent({ 
      type: 'interrogation', 
      dataInizio: futureDate.toISOString(),
      targetStudents: ['student123']
    });
    
    // L'ordine non dovrebbe importare
    componentRef.setInput('events', [eventFar, eventClose]);
    fixture.detectChanges();
    
    expect(component.nextInterrogation()).toEqual(eventClose);
  });
});
