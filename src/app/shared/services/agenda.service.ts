import { Injectable, inject }                                                                 from '@angular/core';
import { AgendaEvent }                                                                         from '../../pages/agenda/models/agendaEvent';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  getDocs,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where
}                                                                                             from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class AgendaService {
    private firestore = inject(Firestore);
    collection="agenda-events"
    getAgenda4targetedClassesOnrealtime(targetedClasses: string[], callBack: (events: AgendaEvent[]) => void) {
        console.log("targetedClasse *", targetedClasses);
        try {
            const collectionRef = collection(this.firestore, this.collection);
            let q = query(collectionRef);
           // q = query(q, where('classKey', 'in', targetedClasses));
            q = query(q, orderBy('date', 'desc'));
           // q = query(q, where('date', '>=', new Date()));
            getDocs(q).then((querySnapshot: QuerySnapshot<DocumentData>) => {
                const events: AgendaEvent[] = [];
                querySnapshot.forEach((doc) => {
                    const event = new AgendaEvent(doc.data());
                    event.setKey(doc.id);
                    events.push(event);
                });
                console.log("events *", events);
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


    constructor() { }

    async addEvent(event: AgendaEvent): Promise<void> {
        const collectionRef: CollectionReference<DocumentData> = collection(this.firestore, 'agenda-events');
        const newEventRef = await addDoc(collectionRef, event.serialize());

        event.creationDate = Date.now();
        return setDoc(newEventRef, event.serialize());
    }

    updateEvent(event: AgendaEvent): Promise<void> {
        if (!event.key) throw new Error('Event key is missing');
        const eventRef = doc(this.firestore, `agenda-events/${event.key}`);
        return updateDoc(eventRef, event.serialize());
    }

    deleteEvent(key: string): Promise<void> {
        const eventRef = doc(this.firestore, `agenda-events/${key}`);
        return deleteDoc(eventRef);
    }


}
