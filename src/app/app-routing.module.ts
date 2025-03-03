// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'calendar', pathMatch: 'full' },
  { 
    path: 'calendar', 
    loadComponent: () => import('./features/calendar/components/calendar-container/calendar-container.component')
      .then(m => m.CalendarContainerComponent)
  },
  { path: '**', redirectTo: 'calendar' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }