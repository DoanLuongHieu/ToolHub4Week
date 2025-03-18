import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'toolhub4week',
        appId: '1:205835177320:web:98c7197b032868328a1add',
        storageBucket: 'toolhub4week.firebasestorage.app',
        apiKey: 'AIzaSyAHpkPNO6qjkzndbJEj8DgQmRve8mOMa-Q',
        authDomain: 'toolhub4week.firebaseapp.com',
        messagingSenderId: '205835177320',
        measurementId: 'G-DD23FSVQ4Y',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};
