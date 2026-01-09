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

/**
 * Servizio per la gestione degli eventi dell'agenda scolastica.
 * Interagisce con Firestore per creare, leggere, aggiornare ed eliminare eventi.
 */
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
    /**
     * Recupera gli eventi dell'agenda in tempo reale per le classi specificate.
     * @param callBack Funzione di callback invocata ad ogni aggiornamento dei dati.
     * @param queries Lista di condizioni query per filtrare gli eventi (es. per classe, per data).
     */
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

    /**
     * Aggiunge un nuovo evento in agenda.
     * @param event L'evento da aggiungere.
     * @returns Promise che si risolve al completamento dell'operazione.
     */
    async addEvent(event: AgendaEvent): Promise<void> {
        const collectionRef: CollectionReference<DocumentData> = this.collectionFn(this.firestore, 'agenda-events');
        const newEventRef = await this.addDocFn(collectionRef, event.serialize());

        event.creationDate = Date.now();
        return this.setDocFn(newEventRef, event.serialize());
    }

    /**
     * Aggiorna un evento esistente.
     * @param event L'evento con i dati aggiornati.
     * @returns Promise che si risolve al completamento dell'aggiornamento.
     * @throws Error se la chiave dell'evento manca.
     */
    updateEvent(event: AgendaEvent): Promise<void> {
        if (!event.key) throw new Error('Event key is missing');
        const eventRef = this.docFn(this.firestore, `agenda-events/${event.key}`);
        return this.updateDocFn(eventRef, event.serialize());
    }

    /**
     * Elimina un evento dall'agenda.
     * @param key La chiave univoca dell'evento da eliminare.
     * @returns Promise che si risolve al completamento della cancellazione.
     */
    deleteEvent(key: string): Promise<void> {
        const eventRef = this.docFn(this.firestore, `agenda-events/${key}`);
        return this.deleteDocFn(eventRef);
    }


}
