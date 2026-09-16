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
   onSnapshot,
   deleteDoc
  } from '@angular/fire/firestore';
import { Grids } from '../../models/grids';

@Injectable({
  providedIn: 'root'
})
export class GridsService {
  private firestore = inject(Firestore);
  collection = 'grids';

  // Store Firebase API functions to avoid injection context warnings and allow mocking in tests
  private collectionFn = collection;
  private queryFn = query;
  private whereFn = where;
  private addDocFn = addDoc;
  private onSnapshotFn = onSnapshot;
  private getDocFn = getDoc;
  private setDocFn = setDoc;
  private deleteDocFn = deleteDoc;
  private docFn = doc;

  async fetchGrid(gridKey: string) {
    const docRef = this.docFn(this.firestore, this.collection, gridKey);
    const rawGrid = await this.getDocFn(docRef);
    return new Grids(rawGrid.data()).setKey(rawGrid.id);
  }
  addGrid(grid: Grids) {
    const collectionRef = this.collectionFn(this.firestore, this.collection)
    return this.addDocFn(collectionRef, grid.serialize());
  }
  updateGrid(gridKey: string, grid: Grids) {
    const docRef = this.docFn(this.firestore, this.collection, gridKey);
    return this.setDocFn(docRef, grid.serialize());
  }
  getGridsOnRealtime(callback: (grids: Grids[]) => void){
    console.log("getGridsOnRealtime");
    const collectionRef = this.collectionFn(this.firestore, this.collection)
    return this.onSnapshotFn(collectionRef, (snapshot) => {
      const grids: Grids[] = [];
      snapshot.forEach((doc) => {
        grids.push( new Grids(doc.data()).setKey(doc.id));
      });
      callback(grids);
    });
  }
}
