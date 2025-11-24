import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, remove, update, orderByChild, equalTo, get, onValue } from '@angular/fire/database';
import { AgendaEvent } from '../../pages/agenda/models/agendaEvent';
import { Observable } from 'rxjs';
import { collection, doc, DocumentData, Firestore, getDocs, orderBy, query, QuerySnapshot, where } from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class AgendaService {
    private firestore = inject(Firestore);
    getAgenda4targetedClassesOnrealtime(targetedClasses: string[], callBack: (events: AgendaEvent[]) => void) {
        console.log("targetedClasses", targetedClasses);
        try {
            const collectionRef = collection(this.firestore, 'agenda-events');
            let q = query(collectionRef);
            q = query(q, where('classKey', 'in', targetedClasses));
            q = query(q, orderBy('date', 'desc'));
            q = query(q, where('date', '>=', new Date()));
            getDocs(q).then((querySnapshot: QuerySnapshot<DocumentData>) => {
                const events: AgendaEvent[] = [];
                querySnapshot.forEach((doc) => {
                    const event = new AgendaEvent(doc.data());
                    event.setKey(doc.id);
                    events.push(event);
                });
                callBack(events);
            });
        }
        catch (e) {
            console.log(e);
        }
    }




    getAgendaOnCache() {
        throw new Error('Method not implemented.');
    }
    private firebase = inject(Database);

    constructor() { }

    addEvent(event: AgendaEvent): Promise<void> {
        const eventsRef = ref(this.firebase, 'agenda-events');
        const newEventRef = push(eventsRef);
        event.setKey(newEventRef.key!);
        event.creationDate = Date.now();
        return set(newEventRef, event.serialize());
    }

    updateEvent(event: AgendaEvent): Promise<void> {
        if (!event.key) throw new Error('Event key is missing');
        const eventRef = ref(this.firebase, `agenda-events/${event.key}`);
        return update(eventRef, event.serialize());
    }

    deleteEvent(key: string): Promise<void> {
        const eventRef = ref(this.firebase, `agenda-events/${key}`);
        return remove(eventRef);
    }


}
