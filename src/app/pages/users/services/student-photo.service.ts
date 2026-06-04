import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

/**
 * Servizio per la gestione della foto profilo dello studente.
 * Gestisce l'upload su Firebase Storage e la restituzione dell'URL pubblico.
 */
@Injectable({ providedIn: 'root' })
export class StudentPhotoService {
  private storage = inject(Storage);

  /**
   * Carica una foto profilo su Firebase Storage.
   * @param userKey Chiave univoca dello studente (usata come nome file).
   * @param blob Il blob dell'immagine ritagliata.
   * @returns Promise con l'URL pubblico del file caricato.
   */
  async uploadPhoto(userKey: string, blob: Blob): Promise<string> {
    const filePath = `students/${userKey}/photo.jpg`;
    const storageRef = ref(this.storage, filePath);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    return getDownloadURL(storageRef);
  }
}
