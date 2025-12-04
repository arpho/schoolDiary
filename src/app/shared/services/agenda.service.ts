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
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where
}                                                                                             from '@angular/fire/firestore';
import { QueryCondition } from '../models/queryCondition';

@Injectable({
    providedIn: 'root'
})
export class AgendaService {
    private firestore = inject(Firestore);
    collection="agenda-events"
    cacheEvents4Class = new Map<string, AgendaEvent>();
    getAgenda4targetedClassesOnrealtime( callBack: (events: AgendaEvent[]) => void,queries:QueryCondition[]) {
        
        try {
            const collectionRef = collection(this.firestore, this.collection);
            let q = query(collectionRef);
         
            queries.forEach(condition => {
                q = query(q, where(condition.field, condition.operator, condition.value));
            });
          //  q = query(q, orderBy('dataInizio', 'desc'));
           // q = query(q, where('date', '>=', new Date()));
           try{
            onSnapshot(q, (snapshot) => {
                const events: AgendaEvent[] = [];
                snapshot.forEach((doc) => {
                    const event = new AgendaEvent(doc.data());
                    event.setKey(doc.id);
                    events.push(event);
                });
                console.log("events *", events);
                callBack(events);
            });
        }
        catch (e) {
            console.log("error fetching")
            console.log(e);
        }
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
