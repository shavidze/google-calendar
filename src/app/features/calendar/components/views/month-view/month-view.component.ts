// src/app/features/calendar/components/month-view/month-view.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

import { AppointmentItemComponent } from '../../appointment-item/appointment-item.component';
import { AppointmentFormComponent } from '../../appointment-form/appointment-form.component';
import { CalendarService } from '../../../../../core/services/calendar.service';
import { AppointmentService } from '../../../../../core/services/appointment.service';
import { Appointment } from '../../../../../core/models/appointment';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    DragDropModule,
    AppointmentItemComponent
  ],
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MonthViewComponent implements OnInit {
  calendarDays$: Observable<{ date: Date; appointments: Appointment[] }[]>;
  today = new Date();

  weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  constructor(
    private calendarService: CalendarService,
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {
    // Create observable for calendar days with appointments
    this.calendarDays$ = this.calendarService.currentDate$.pipe(
      switchMap(currentDate => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = this.calendarService.getDaysInMonth(year, month);
        
        // Get appointments for each day
        return this.appointmentService.getAppointments().pipe(
          map(allAppointments => {
            return days.map(day => {
              const dayStart = new Date(day);
              dayStart.setHours(0, 0, 0, 0);
              
              const dayEnd = new Date(day);
              dayEnd.setHours(23, 59, 59, 999);
              
              const appointments = allAppointments.filter(apt => {
                const appointmentDate = new Date(apt.startDate);
                return appointmentDate >= dayStart && appointmentDate <= dayEnd;
              });
              
              // Sort appointments by start time
              appointments.sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
              );
              
              return { date: day, appointments };
            });
          })
        );
      })
    );
  }

  ngOnInit(): void {}

  isToday(date: Date): boolean {
    return this.calendarService.isSameDay(date, this.today);
  }

  isCurrentMonth(date: Date, referenceDate: Date): boolean {
    return date.getMonth() === referenceDate.getMonth() && 
           date.getFullYear() === referenceDate.getFullYear();
  }

  // Handle appointment drop between days
  drop(event: CdkDragDrop<Appointment[]>, targetDate: Date): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same day - not crucial for this implementation
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving to a different day
      const appointment = event.previousContainer.data[event.previousIndex];
      
      // Calculate the day difference to adjust the appointment dates
      const originalDate = new Date(appointment.startDate);
      const originalDay = originalDate.getDate();
      const targetDay = targetDate.getDate();
      const dayDifference = targetDay - originalDay;
      
      // Create new appointment with adjusted dates
      const updatedAppointment: Appointment = {
        ...appointment,
        startDate: new Date(appointment.startDate.getTime() + dayDifference * 24 * 60 * 60 * 1000),
        endDate: new Date(appointment.endDate.getTime() + dayDifference * 24 * 60 * 60 * 1000)
      };
      
      this.appointmentService.updateAppointment(updatedAppointment);
      
      // Update the UI
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  // Open form to add appointment on a specific date
  addAppointmentForDay(date: Date): void {
    this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: { date }
    });
  }

  // Handle click on a calendar day
  onDayClick(date: Date): void {
    this.addAppointmentForDay(date);
  }
}