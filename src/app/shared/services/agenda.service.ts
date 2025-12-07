import { Injectable, inject } from '@angular/core';
import { AgendaEvent } from '../../pages/agenda/models/agendaEvent';
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
} from '@angular/fire/firestore';
import { QueryCondition } from '../models/queryCondition';

@Injectable({
    providedIn: 'root'
})
export class AgendaService {
    private firestore = inject(Firestore);
    collectionName = "agenda-events"
    cacheEvents4Class = new Map<string, AgendaEvent>();

    // Store Firebase API functions to avoid injection context warnings
    private collectionFn = collection;
    private queryFn = query;
    private whereFn = where;
    private addDocFn = addDoc;
    private onSnapshotFn = onSnapshot;
    private setDocFn = setDoc;
    private updateDocFn = updateDoc;
    private deleteDocFn = deleteDoc;
    private docFn = doc;
    private getDocsFn = getDocs;
    private orderByFn = orderBy;
    getAgenda4targetedClassesOnrealtime(callBack: (events: AgendaEvent[]) => void, queries: QueryCondition[]) {

        try {
            const collectionRef = this.collectionFn(this.firestore, this.collectionName);
            let q = this.queryFn(collectionRef);

            queries.forEach(condition => {
                q = this.queryFn(q, this.whereFn(condition.field, condition.operator, condition.value));
            });
            //  q = query(q, orderBy('dataInizio', 'desc'));
            // q = query(q, where('date', '>=', new Date()));
            try {
                this.onSnapshotFn(q, (snapshot) => {
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
        const collectionRef: CollectionReference<DocumentData> = this.collectionFn(this.firestore, 'agenda-events');
        const newEventRef = await this.addDocFn(collectionRef, event.serialize());

        event.creationDate = Date.now();
        return this.setDocFn(newEventRef, event.serialize());
    }

    updateEvent(event: AgendaEvent): Promise<void> {
        if (!event.key) throw new Error('Event key is missing');
        const eventRef = this.docFn(this.firestore, `agenda-events/${event.key}`);
        return this.updateDocFn(eventRef, event.serialize());
    }

    deleteEvent(key: string): Promise<void> {
        const eventRef = this.docFn(this.firestore, `agenda-events/${key}`);
        return this.deleteDocFn(eventRef);
    }


}
