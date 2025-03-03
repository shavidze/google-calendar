// src/app/features/calendar/calendar.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CalendarRoutingModule } from './calendar-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { MonthViewComponent } from './components/views/month-view/month-view.component';
import { WeekViewComponent } from './components/views/week-view/week-view.component';
import { DayViewComponent } from './components/views/day-view/day-view.component';

const VIEWS = [MonthViewComponent, WeekViewComponent, DayViewComponent];
const MATERIAL_MODULES = [ 
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatToolbarModule,
  MatTooltipModule
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    ReactiveFormsModule,
    DragDropModule,
    SharedModule,
    ...[VIEWS],
    ...[MATERIAL_MODULES],
  ],
  exports: VIEWS
})
export class CalendarModule { }