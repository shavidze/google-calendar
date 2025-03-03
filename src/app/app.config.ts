import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';

import { routes } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

export const appConfig: ApplicationConfig = {
  providers: [ 
    importProvidersFrom(RouterModule.forRoot(routes)),
    importProvidersFrom(MatDialogModule),
    importProvidersFrom(MatDatepickerModule),
    importProvidersFrom(MatNativeDateModule),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideAnimations(),
    provideRouter(routes)
  ]
};
