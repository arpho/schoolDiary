import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, remove, update, query, orderByChild, equalTo, get, onValue } from '@angular/fire/database';
import { AgendaEvent } from '../../pages/agenda/models/agendaEvent';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AgendaService {
    private db = inject(Database);

    constructor() { }

    addEvent(event: AgendaEvent): Promise<void> {
        const eventsRef = ref(this.db, 'agenda-events');
        const newEventRef = push(eventsRef);
        event.setKey(newEventRef.key!);
        event.creationDate = Date.now();
        return set(newEventRef, event.serialize());
    }

    updateEvent(event: AgendaEvent): Promise<void> {
        if (!event.key) throw new Error('Event key is missing');
        const eventRef = ref(this.db, `agenda-events/${event.key}`);
        return update(eventRef, event.serialize());
    }

    deleteEvent(key: string): Promise<void> {
        const eventRef = ref(this.db, `agenda-events/${key}`);
        return remove(eventRef);
    }

    getEvents(teacherKey: string, classKey?: string): Observable<AgendaEvent[]> {
        return new Observable(observer => {
            const eventsRef = ref(this.db, 'agenda-events');
            let q = query(eventsRef, orderByChild('teacherKey'), equalTo(teacherKey));

            const unsubscribe = onValue(q, (snapshot) => {
                const events: AgendaEvent[] = [];
                snapshot.forEach((childSnapshot) => {
                    const eventData = childSnapshot.val();
                    const event = new AgendaEvent(eventData);
                    if (childSnapshot.key) {
                        event.setKey(childSnapshot.key);
                    }

                    if (!classKey || event.classKey === classKey) {
                        events.push(event);
                    }
                });
                // Sort by date
                events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                observer.next(events);
            }, (error) => {
                observer.error(error);
            });

            return () => unsubscribe();
        });
    }
}
