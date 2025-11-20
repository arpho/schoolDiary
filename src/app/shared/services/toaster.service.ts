import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  showToast(data:{message?: string, duration?: number , position: "bottom" | "top" | "middle"},color?: string) {
    this.presentToast(data,color);
  }
  private toastCtrl = inject(ToastController);


  async presentToast(data:{message?: string, duration?: number , position?: "bottom" | "top" | "middle"},color?: string) {
    const toast = await this.toastCtrl.create({
      message: data.message,
      duration: data.duration,
      position: data.position,
      color: color
    });
    toast.present();
    setTimeout(() => {
      toast.dismiss();
    }, data.duration);
  }
}
