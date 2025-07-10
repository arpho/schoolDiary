import { Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc, where,query, getDocs, addDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Grids } from '../../models/grids';

@Injectable({
  providedIn: 'root'
})
export class GridsService {
collection = 'grids';
  constructor(private firestore: Firestore) { }
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
