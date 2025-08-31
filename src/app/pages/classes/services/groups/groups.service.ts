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
  deleteDoc
} from '@angular/fire/firestore';
import { GroupModel } from '../../models/groupModel';
import { UsersService } from 'src/app/shared/services/users.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private collection = 'groups';
  private firestore = inject(Firestore);
  private $usersService = inject(UsersService);

  constructor() {}

  /**
   * Fetches all groups for a specific class
   * @param classKey The key of the class
   * @param callback Callback function that receives the array of groups
   */
  fetchGroups4class(classKey: string, callback: (groups: GroupModel[]) => void) {
    const q = query(
      collection(this.firestore, this.collection),
      where('classKey', '==', classKey)
    );

onSnapshot(q, async (querySnapshot) => {
      const groups: GroupModel[] = [];
      for (const doc of querySnapshot.docs) {
        const group = new GroupModel({ ...doc.data(), key: doc.id },this.$usersService);
        await group.fetchStudents();
        groups.push(group);
      }
      callback(groups);
    });
  }

  /**
   * Fetches the group that a specific student belongs to in a class
   * @param studentKey The key of the student
   * @param classKey The key of the class
   * @returns Promise that resolves with the group or null if not found
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
   * Updates an existing group
   * @param group The group to update
   * @returns Promise that resolves when the update is complete
   */
  async updateGroup(group: GroupModel): Promise<void> {
    const groupRef = doc(this.firestore, `${this.collection}/${group.key}`);
    await setDoc(groupRef, group.serialize(), { merge: true });
  }

  /**
   * Creates a new group
   * @param group The group to create
   * @returns Promise that resolves with the created group's ID
   */
  async createGroup(group: GroupModel): Promise<string> {
    console.log("creazione gruppo",group)
    const docRef = await addDoc(collection(this.firestore, this.collection), group.serialize());
    return docRef.id;
  }

  /**
   * Deletes a group
   * @param groupKey The key of the group to delete
   * @returns Promise that resolves when the deletion is complete
   */
  async deleteGroup(groupKey: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${this.collection}/${groupKey}`));
  }
}
