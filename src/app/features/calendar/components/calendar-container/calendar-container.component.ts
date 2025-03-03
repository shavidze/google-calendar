// src/app/features/calendar/components/calendar-container/calendar-container.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';

import { MonthViewComponent } from '../views/month-view/month-view.component';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { CalendarService } from '../../../../core/services/calendar.service';
import { WeekViewComponent } from '../views/week-view/week-view.component';
import { DayViewComponent } from '../views/day-view/day-view.component';

@Component({
  selector: 'app-calendar-container',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    MatTooltipModule,
    MonthViewComponent,
    WeekViewComponent, 
    DayViewComponent,
    AppointmentFormComponent
  ],
  templateUrl: './calendar-container.component.html',
  styleUrls: ['./calendar-container.component.scss'],
})
export class CalendarContainerComponent implements OnInit {
  currentDate$: Observable<Date>;
  currentView: 'month' | 'week' | 'day' = 'month';

  constructor(
    private calendarService: CalendarService,
    private dialog: MatDialog
  ) {
    this.currentDate$ = this.calendarService.getCurrentDate();
  }

  ngOnInit(): void {}

  previousPeriod(): void {
    switch (this.currentView) {
      case 'month':
        this.calendarService.previousMonth();
        break;
      case 'week':
        this.calendarService.previousWeek();
        break;
      case 'day':
        this.calendarService.previousDay();
        break;
    }
  }

  nextPeriod(): void {
    switch (this.currentView) {
      case 'month':
        this.calendarService.nextMonth();
        break;
      case 'week':
        this.calendarService.nextWeek();
        break;
      case 'day':
        this.calendarService.nextDay();
        break;
    }
  }

  today(): void {
    this.calendarService.setCurrentDate(new Date());
  }

  openAppointmentForm(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '95vw';
    dialogConfig.maxHeight = '95vh';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'appointment-dialog';
    dialogConfig.data = { date: new Date() };
    
    const dialogRef = this.dialog.open(AppointmentFormComponent, dialogConfig);
    
    dialogRef.afterOpened().subscribe(() => {
      console.log('Dialog opened successfully');
    });
    
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
    });
  }

  switchView(view: 'month' | 'week' | 'day'): void {
    this.currentView = view;
  }


  getViewTitle(date: Date | null): string {
    if (!date) return '';
    
    switch (this.currentView) {
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short' })} ${weekStart.getDate()} - ${weekEnd.toLocaleDateString('en-US', { month: 'short' })} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
      case 'day':
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      default:
        return '';
    }
  }
}