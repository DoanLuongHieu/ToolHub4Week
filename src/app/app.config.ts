import { ApplicationConfig, ErrorHandler, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// Factory function for theme initialization
export function initializeTheme(themeService: ThemeService) {
  return () => themeService.initTheme();
}

// Factory function for language initialization
export function initializeLanguage(languageService: LanguageService) {
  return () => languageService.initLanguage();
}

// Factory function for Http Loader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [ThemeService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLanguage,
      deps: [LanguageService],
      multi: true
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        defaultLanguage: 'vi'
      })
    ),
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
