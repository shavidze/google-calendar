import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';

import { routes } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [ 
    importProvidersFrom(RouterModule.forRoot(routes)),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideAnimations(),
    provideRouter(routes)
  ]
};
