import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  where,
  query,
  getDocs,
  onSnapshot,
  getDoc,
  addDoc,
  deleteDoc,
  writeBatch
} from '@angular/fire/firestore';
import { GroupModel } from '../../models/groupModel';
import { UsersService } from 'src/app/shared/services/users.service';

/**
 * Servizio per la gestione dei Gruppi all'interno delle classi.
 * Permette di creare, modificare, eliminare e spostare studenti tra gruppi.
 */
@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  readonly collectionName = 'groups';
  readonly firestore = inject(Firestore);
  readonly $usersService = inject(UsersService);

  // Store Firebase API functions to avoid injection context warnings and allow mocking in tests
  private collectionFn = collection;
  private queryFn = query;
  private whereFn = where;
  private getDocsFn = getDocs;
  private addDocFn = addDoc;
  private onSnapshotFn = onSnapshot;
  private getDocFn = getDoc;
  private setDocFn = setDoc;
  private deleteDocFn = deleteDoc;
  private docFn = doc;
  private writeBatchFn = writeBatch;

  constructor() { }
  /**
   * Aggiorna in modo atomico i dati di due gruppi (origine e destinazione)
   * utilizzando una transazione batch di Firestore.
   * 
   * @param originGroup Il gruppo di origine da aggiornare
   * @param destinationGroup Il gruppo di destinazione da aggiornare
   * @returns Promise che si risolve quando l'operazione batch è completata
   */
  UpdateOriginAndDestinationGroups(originGroup: GroupModel, destinationGroup: GroupModel) {
    // Crea un'operazione batch per eseguire più operazioni atomicamente
    const batch = this.writeBatchFn(this.firestore);
    batch.update(this.docFn(this.firestore, `${this.collectionName}/${originGroup.key}`), originGroup.serialize());
    batch.update(this.docFn(this.firestore, `${this.collectionName}/${destinationGroup.key}`), destinationGroup.serialize());
    return batch.commit();
  }

  /**
   * Recupera tutti i gruppi di una specifica classe in tempo reale.
   * Scarica anche i dettagli degli studenti per ogni gruppo.
   * @param classKey Chiave della classe.
   * @param callback Callback che riceve l'array di Gruppi aggiornato.
   * @returns Unsubscribe function.
   */
  fetchGroups4class(classKey: string, callback: (groups: GroupModel[]) => void) {
    const q = this.queryFn(
      this.collectionFn(this.firestore, this.collectionName),
      this.whereFn('classKey', '==', classKey)
    );

    return this.onSnapshotFn(q, async (querySnapshot) => {
      const groups: GroupModel[] = [];
      for (const doc of querySnapshot.docs) {
        const group = new GroupModel({ ...doc.data(), key: doc.id }, this.$usersService);
        await group.fetchStudents();
        groups.push(group);
      }
      callback(groups);
    });
  }

  /**
   * Trova il gruppo a cui appartiene uno specifico studente in una classe.
   * @param studentKey Chiave dello studente.
   * @param classKey Chiave della classe.
   * @returns Promise che risolve con il gruppo trovato o null.
   */
  async fetchGroupMember(studentKey: string, classKey: string): Promise<GroupModel | null> {
    const q = this.queryFn(
      this.collectionFn(this.firestore, this.collectionName),
      this.whereFn('classKey', '==', classKey),
      this.whereFn('studentsKeyList', 'array-contains', studentKey)
    );

    const querySnapshot = await this.getDocsFn(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Assuming a student can only be in one group per class
    const doc = querySnapshot.docs[0];
    const group = new GroupModel({ ...doc.data(), key: doc.id });
    await group.fetchStudents();
    return group;
  }

  /**
   * Trova il gruppo a cui appartiene uno specifico studente in una classe per una materia.
   * @param studentKey Chiave dello studente.
   * @param classKey Chiave della classe.
   * @param subjectKey Chiave della materia.
   * @returns Promise che risolve con il gruppo trovato o null.
   */
  async fetchStudentGroup(studentKey: string, classKey: string, subjectKey: string): Promise<GroupModel | null> {
    try {
      const q = this.queryFn(
        this.collectionFn(this.firestore, this.collectionName),
        this.whereFn('classKey', '==', classKey),
        this.whereFn('subjectKey', '==', subjectKey),
        this.whereFn('studentsKeyList', 'array-contains', studentKey)
      );

      const querySnapshot = await this.getDocsFn(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      const group = new GroupModel({ ...docSnap.data(), key: docSnap.id }, this.$usersService);
      await group.fetchStudents();
      return group;
    } catch (error) {
      console.error('Errore durante il recupero del gruppo dello studente. Potrebbe essere necessario creare un indice su Firestore:', error);
      throw error;
    }
  }

  /**
   * Aggiorna i dati di un gruppo esistente.
   * @param group Il gruppo con i dati aggiornati.
   * @returns Promise vuota.
   */
  async updateGroup(group: GroupModel): Promise<void> {
    const groupRef = this.docFn(this.firestore, `${this.collectionName}/${group.key}`);
    console.log("updating Group", group, group.serialize())
    await this.setDocFn(groupRef, group.serialize(), { merge: true });
  }

  /**
   * Crea un nuovo gruppo.
   * @param group Il gruppo da creare.
   * @returns Promise con l'ID del gruppo creato.
   */
  async createGroup(group: GroupModel): Promise<string> {
    console.log("creazione gruppo", group)
    const docRef = await this.addDocFn(this.collectionFn(this.firestore, this.collectionName), group.serialize());
    return docRef.id;
  }

  /**
   * Elimina un gruppo.
   * @param groupKey Chiave del gruppo da eliminare.
   * @returns Promise vuota.
   */
  async deleteGroup(groupKey: string): Promise<void> {
    await this.deleteDocFn(this.docFn(this.firestore, `${this.collectionName}/${groupKey}`));
  }
}
