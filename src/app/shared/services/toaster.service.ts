import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(
    private toastCtrl: ToastController
  ) { }

  async presentToast(data:{message?: string, duration?: number , position: "bottom" | "top" | "middle"}) {
    const toast = await this.toastCtrl.create({
      message: data.message,
      duration: data.duration,
      position: data.position   
    });
    toast.present();
  }
}
