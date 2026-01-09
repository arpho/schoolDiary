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
  readonly collection = 'groups';
  readonly firestore = inject(Firestore);
  readonly $usersService = inject(UsersService);

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
    const batch = writeBatch(this.firestore);
    batch.update(doc(this.firestore, `${this.collection}/${originGroup.key}`), originGroup.serialize());
    batch.update(doc(this.firestore, `${this.collection}/${destinationGroup.key}`), destinationGroup.serialize());
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
    const q = query(
      collection(this.firestore, this.collection),
      where('classKey', '==', classKey)
    );

    return onSnapshot(q, async (querySnapshot) => {
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
    const q = query(
      collection(this.firestore, this.collection),
      where('classKey', '==', classKey),
      where('studentsKeyList', 'array-contains', studentKey)
    );

    const querySnapshot = await getDocs(q);

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
   * Aggiorna i dati di un gruppo esistente.
   * @param group Il gruppo con i dati aggiornati.
   * @returns Promise vuota.
   */
  async updateGroup(group: GroupModel): Promise<void> {
    const groupRef = doc(this.firestore, `${this.collection}/${group.key}`);
    console.log("updating Group", group, group.serialize())
    await setDoc(groupRef, group.serialize(), { merge: true });
  }

  /**
   * Crea un nuovo gruppo.
   * @param group Il gruppo da creare.
   * @returns Promise con l'ID del gruppo creato.
   */
  async createGroup(group: GroupModel): Promise<string> {
    console.log("creazione gruppo", group)
    const docRef = await addDoc(collection(this.firestore, this.collection), group.serialize());
    return docRef.id;
  }

  /**
   * Elimina un gruppo.
   * @param groupKey Chiave del gruppo da eliminare.
   * @returns Promise vuota.
   */
  async deleteGroup(groupKey: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${this.collection}/${groupKey}`));
  }
}
