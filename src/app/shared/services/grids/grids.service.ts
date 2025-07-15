import { Injectable, inject } from '@angular/core';
import {
   collection,
   doc,
   Firestore,
   setDoc,
   where,
   query,
   getDocs,
   addDoc,
   getDoc,
   onSnapshot 
  } from '@angular/fire/firestore';
import { Grids } from '../../models/grids';

@Injectable({
  providedIn: 'root'
})
export class GridsService {
  async fetchGrid(gridKey: string) {
    const docRef = doc(this.firestore, this.collection, gridKey);
    const rawGrid = await getDoc(docRef);
    return new Grids(rawGrid.data()).setKey(rawGrid.id);
  }
  addGrid(grid: Grids) {
    const collectionRef = collection(this.firestore, this.collection)
    return addDoc(collectionRef, grid.serialize());
  }
  updateGrid(gridKey: string, grid: Grids) {
    const docRef = doc(this.firestore, this.collection, gridKey);
    return setDoc(docRef, grid.serialize());
  }
private firestore = inject(Firestore);

collection = 'grids';
  getGridsOnRealtime(callback: (grids: Grids[]) => void){
    const collectionRef = collection(this.firestore, this.collection)
    return onSnapshot(collectionRef, (snapshot) => {
      const grids: Grids[] = [];
      snapshot.forEach((doc) => {
        grids.push( new Grids(doc.data()).setKey(doc.id));
      });
      callback(grids);
    });
  }
}
