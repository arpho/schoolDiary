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
    getAgenda4targetedClassesOnrealtime(callBack: (events: AgendaEvent[]) => void, queries: QueryCondition[]): () => void {
        try {
            const collectionRef = this.collectionFn(this.firestore, this.collectionName);

            // Cerca se c'è una condizione su classKey con array-contains-any
            const classKeyIndex = queries.findIndex(q => q.field === 'classKey' && q.operator === 'array-contains-any');

            if (classKeyIndex !== -1) {
                const classCond = queries[classKeyIndex];
                const otherQueries = queries.filter((_, i) => i !== classKeyIndex);

                // Prepariamo le due query
                let qArray = this.queryFn(collectionRef, this.whereFn(classCond.field, 'array-contains-any', classCond.value));
                let qString = this.queryFn(collectionRef, this.whereFn(classCond.field, 'in', classCond.value));

                // Applichiamo gli altri filtri ad entrambe
                otherQueries.forEach(condition => {
                    const whereClause = this.whereFn(condition.field, condition.operator, condition.value);
                    qArray = this.queryFn(qArray, whereClause);
                    qString = this.queryFn(qString, whereClause);
                });

                let eventsArray: AgendaEvent[] = [];
                let eventsString: AgendaEvent[] = [];

                const mergeAndEmit = () => {
                    const combined = [...eventsArray, ...eventsString];
                    // Rimuovi duplicati basati sulla chiave/id
                    const uniqueMap = new Map<string, AgendaEvent>();
                    combined.forEach(e => {
                        const id = e.key || e.id;
                        if (id) uniqueMap.set(id, e);
                    });
                    callBack(Array.from(uniqueMap.values()));
                };

                const unsubArray = this.onSnapshotFn(qArray, (snapshot) => {
                    eventsArray = [];
                    snapshot.forEach((doc) => {
                        const event = new AgendaEvent(doc.data());
                        event.setKey(doc.id);
                        eventsArray.push(event);
                    });
                    mergeAndEmit();
                }, (err) => console.error("Error in qArray:", err));

                const unsubString = this.onSnapshotFn(qString, (snapshot) => {
                    eventsString = [];
                    snapshot.forEach((doc) => {
                        const event = new AgendaEvent(doc.data());
                        event.setKey(doc.id);
                        eventsString.push(event);
                    });
                    mergeAndEmit();
                }, (err) => console.error("Error in qString:", err));

                return () => {
                    unsubArray();
                    unsubString();
                };
            } else {
                // Comportamento standard per altre query
                let q = this.queryFn(collectionRef);
                queries.forEach(condition => {
                    q = this.queryFn(q, this.whereFn(condition.field, condition.operator, condition.value));
                });

                return this.onSnapshotFn(q, (snapshot) => {
                    const events: AgendaEvent[] = [];
                    snapshot.forEach((doc) => {
                        const event = new AgendaEvent(doc.data());
                        event.setKey(doc.id);
                        events.push(event);
                    });
                    callBack(events);
                }, (err) => {
                    console.error("error fetching", err);
                });
            }
        } catch (e) {
            console.error("error setting up query", e);
            return () => { };
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
