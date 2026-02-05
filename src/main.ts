
import {
  IonicModule
} from '@ionic/angular';
import {
  bootstrapApplication
} from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular/standalone';
import {
  provideFirebaseApp,
  initializeApp
} from '@angular/fire/app';
import {
  provideAuth,
  getAuth
} from '@angular/fire/auth';
import {
  FIREBASE_OPTIONS
} from '@angular/fire/compat';
import {
  routes
} from './app/app.routes';
import {
  AppComponent
} from './app/app.component';
import {
  importProvidersFrom, isDevMode
} from '@angular/core';
import {
  environment
} from './environments/environment';
import {
  provideHttpClient
} from '@angular/common/http';
import {
  getFirestore,
  provideFirestore
} from '@angular/fire/firestore';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { addIcons } from 'ionicons';
import {
  wifi,
  wifiOutline
} from 'ionicons/icons';
import { IconService } from './app/core/services/icon.service';
import {
  addCircle,
  filter,
  add,
  push,
  addCircleOutline,
  removeCircle,
  remove,
  createOutline,
  trashOutline,
  eyeOutline,
  ellipsisHorizontal,
  statsChartOutline,
  recordingOutline,
  ribbonOutline
} from 'ionicons/icons';
import { provideServiceWorker } from '@angular/service-worker';


// Registra le icone globalmente
addIcons({
  wifi,
  'wifi-outline': wifiOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    IconService,
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicModule.forRoot()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig }, provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
});
