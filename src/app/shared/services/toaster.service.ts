import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toastCtrl = inject(ToastController);


  async presentToast(data:{message?: string, duration?: number , position: "bottom" | "top" | "middle"}) {
    const toast = await this.toastCtrl.create({
      message: data.message,
      duration: data.duration,
      position: data.position   
    });
    toast.present();
  }
}
