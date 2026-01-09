import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

/**
 * Servizio per mostrare notifiche toast nell'applicazione.
 */
@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  /**
   * Mostra un toast con le opzioni specificate.
   * Modifica interna per usare direttamente il metodo `presentToast`.
   * @param data Oggetto di configurazione del toast (messaggio, durata, posizione).
   * @param color Colore del toast (es. 'success', 'danger', 'warning').
   */
  showToast(data: { message?: string, duration?: number, position: "bottom" | "top" | "middle" }, color?: string) {
    this.presentToast(data, color);
  }
  private toastCtrl = inject(ToastController);


  /**
   * Metodo interno per creare e presentare il toast tramite `ToastController`.
   * @param data Configurazione del toast.
   * @param color Colore opzionale.
   */
  async presentToast(data: { message?: string, duration?: number, position?: "bottom" | "top" | "middle" }, color?: string) {
    const toast = await this.toastCtrl.create({
      message: data.message,
      duration: data.duration,
      position: data.position,
      color: color
    });
    toast.present();
    // Gestione manuale della dismiss se necessario, anche se duration lo fa automaticamente?
    // Il codice originale forza dismiss dopo duration.
    setTimeout(() => {
      toast.dismiss();
    }, data.duration);
  }
}
