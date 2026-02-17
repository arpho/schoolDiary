import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    setDoc,
    where,
    query,
    addDoc,
    getDoc,
    onSnapshot,
    deleteDoc,
} from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { TimetableModel } from '../models/timetable.model';
import { BehaviorSubject } from 'rxjs';
import { QueryCondition } from 'src/app/shared/models/queryCondition';

/**
 * Servizio per la gestione dell'orario scolastico.
 * Gestisce la creazione, lettura, aggiornamento e cancellazione degli elementi dell'orario.
 */
@Injectable({
    providedIn: 'root'
})
export class TimetableService {
    private firestore = inject(Firestore);
    private collectionName = 'timetable';

    // BehaviorSubject per gestire lo stato dell'orario
    private timetableSubject = new BehaviorSubject<TimetableModel[]>([]);
    public timetable$ = this.timetableSubject.asObservable();

    constructor() {
    }

    /**
     * Crea un nuovo elemento dell'orario.
     * @param timetableItem Modello dell'elemento da creare.
     * @returns Promise con l'elemento creato (e chiave assegnata).
     */
    async createTimetableItem(timetableItem: TimetableModel): Promise<TimetableModel> {
        const collectionRef = collection(this.firestore, this.collectionName);
        const docRef = await addDoc(collectionRef, timetableItem.serialize());
        timetableItem.key = docRef.id;
        return timetableItem;
    }

    private unsubscribeTimetable = new Subject<void>();
    private currentSubscription: (() => void) | null = null;

    /**
     * Recupera la lista degli elementi dell'orario in tempo reale.
     * @param callback Callback con la lista aggiornata.
     * @param queries Filtri opzionali.
     * @returns Unsubscribe function.
     */
    fetchTimetableListOnRealTime(callback: (timetable: TimetableModel[]) => void, queries: QueryCondition[] = []): () => void {
        // Annulla la sottoscrizione precedente
        this.unsubscribeTimetable.next();

        let q = query(collection(this.firestore, this.collectionName));
        if (queries.length > 0) {
            queries.forEach((condition: QueryCondition) => {
                q = query(q, where(condition.field, condition.operator, condition.value));
            });
        }

        const timetableList: TimetableModel[] = [];

        const unsubscribe = onSnapshot(q, {
            next: (snapshot) => {
                timetableList.length = 0; // Svuota l'array mantenendo il riferimento
                snapshot.forEach((docSnap) => {
                    timetableList.push(new TimetableModel(docSnap.data()).setKey(docSnap.id));
                });
                callback([...timetableList]); // Invia una copia dell'array
            },
            error: (error) => console.error("Error fetching timetable:", error)
        });

        // Salva la funzione di unsubscribe
        this.currentSubscription = unsubscribe;

        // Restituisci una funzione per annullare la sottoscrizione
        return () => {
            if (this.currentSubscription) {
                this.currentSubscription();
                this.currentSubscription = null;
            }
        };
    }

    /**
     * Recupera un singolo elemento dell'orario.
     * @param key Chiave dell'elemento.
     * @returns Promise con il modello o undefined.
     */
    async fetchTimetableItem(key: string): Promise<TimetableModel | undefined> {
        const docRef = doc(this.firestore, this.collectionName, key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return new TimetableModel(docSnap.data()).setKey(docSnap.id);
        }
        return undefined;
    }

    /**
     * Recupera più elementi dati le loro chiavi.
     * @param keys Array di chiavi.
     * @returns Promise con array di modelli.
     */
    async fetchTimetableItemsByKeys(keys: string[]): Promise<TimetableModel[]> {
        const promises = keys.map(key => this.fetchTimetableItem(key));
        const results = await Promise.all(promises);
        return results.filter((t): t is TimetableModel => t !== undefined);
    }

    /**
     * Aggiorna un elemento esistente.
     * @param timetableItem Modello aggiornato.
     * @returns Promise vuota.
     */
    updateTimetableItem(timetableItem: TimetableModel): Promise<void> {
        const docRef = doc(this.firestore, this.collectionName, timetableItem.key);
        return setDoc(docRef, timetableItem.serialize(), { merge: true });
    }

    /**
     * Elimina un elemento dell'orario.
     * @param key Chiave dell'elemento.
     * @returns Promise vuota.
     */
    deleteTimetableItem(key: string): Promise<void> {
        const docRef = doc(this.firestore, this.collectionName, key);
        return deleteDoc(docRef);
    }

}
