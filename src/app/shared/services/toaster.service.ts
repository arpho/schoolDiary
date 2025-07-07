import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(
    private toastCtrl: ToastController
  ) { }

  presentToast(data:{message?: string, duration?: number , position?: string}) {

}}
