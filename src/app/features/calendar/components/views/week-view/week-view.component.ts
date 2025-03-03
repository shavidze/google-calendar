// src/app/features/calendar/components/week-view/week-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Observable, map, switchMap } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CalendarService } from '../../../../../core/services/calendar.service';
import { AppointmentService } from '../../../../../core/services/appointment.service';
import { Appointment } from '../../../../../core/models/appointment';
import { AppointmentFormComponent } from '../../appointment-form/appointment-form.component';

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    DragDropModule
  ],
  template: `
    <div class="week-view-container">
      <div class="time-labels">
        <div class="time-label" *ngFor="let hour of hours">{{ hour }}</div>
      </div>
      
      <div class="days-container">
        <div class="day-headers">
          <div class="day-header" *ngFor="let day of weekDays$ | async">
            <div class="day-name">{{ day.date | date:'EEE' }}</div>
            <div class="day-number" [class.today]="isToday(day.date)">
              {{ day.date | date:'d' }}
            </div>
          </div>
        </div>
        
        <div class="week-grid">
          <div class="hour-rows">
            <div class="hour-row" *ngFor="let hour of hours"></div>
          </div>
          
          <div class="days-grid">
            <div class="day-column" *ngFor="let day of weekDays$ | async" (click)="onTimeSlotClick($event, day.date)">
              <div class="hour-cell" *ngFor="let hour of hours"></div>
              
              <div 
                *ngFor="let appointment of day.appointments" 
                class="week-appointment"
                [style.top.px]="getAppointmentTop(appointment)"
                [style.height.px]="getAppointmentHeight(appointment)"
                [style.backgroundColor]="appointment.color || '#4285f4'"
                (click)="onAppointmentClick($event, appointment)">
                <div class="appointment-title">{{ appointment.title }}</div>
                <div class="appointment-time">
                  {{ appointment.startDate | date:'shortTime' }} - {{ appointment.endDate | date:'shortTime' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .week-view-container {
      display: flex;
      height: calc(100vh - 64px);
      overflow-y: auto;
      font-family: 'Roboto', sans-serif;
    }

    .time-labels {
      width: 60px;
      border-right: 1px solid #dadce0;
      padding-top: 48px; /* Space for day headers */
    }

    .time-label {
      height: 48px;
      padding-right: 8px;
      text-align: right;
      font-size: 10px;
      color: #70757a;
      transform: translateY(-6px);
    }

    .days-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .day-headers {
      display: flex;
      height: 48px;
      border-bottom: 1px solid #dadce0;
    }

    .day-header {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #dadce0;
    }

    .day-name {
      font-size: 11px;
      font-weight: 500;
      color: #70757a;
    }

    .day-number {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #3c4043;
      
      &.today {
        background-color: #1a73e8;
        color: white;
        border-radius: 50%;
      }
    }

    .week-grid {
      display: flex;
      flex: 1;
      position: relative;
    }

    .hour-rows {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
    }

    .hour-row {
      height: 48px;
      border-bottom: 1px solid #dadce0;
    }

    .days-grid {
      display: flex;
      flex: 1;
      z-index: 1;
      position: relative;
    }

    .day-column {
      flex: 1;
      border-right: 1px solid #dadce0;
      position: relative;
      min-width: 120px;
    }

    .hour-cell {
      height: 48px;
      cursor: pointer;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }

    .week-appointment {
      position: absolute;
      left: 1px;
      right: 1px;
      border-radius: 4px;
      padding: 4px 8px;
      color: white;
      overflow: hidden;
      cursor: pointer;
      
      &:hover {
        box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
      }
    }

    .appointment-title {
      font-weight: 500;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .appointment-time {
      font-size: 10px;
      opacity: 0.85;
    }
  `]
})
export class WeekViewComponent implements OnInit {
  hours = [
    '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];
  
  weekDays$: Observable<{ date: Date; appointments: Appointment[] }[]>;

  constructor(
    private calendarService: CalendarService,
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {
    this.weekDays$ = this.calendarService.currentDate$.pipe(
      map(currentDate => this.getWeekDays(currentDate)),
      switchMap(weekDays => {
        return this.appointmentService.getAppointments().pipe(
          map(allAppointments => {
            return weekDays.map(day => {
              const dayStart = new Date(day);
              dayStart.setHours(0, 0, 0, 0);
              
              const dayEnd = new Date(day);
              dayEnd.setHours(23, 59, 59, 999);
              
              const appointments = allAppointments.filter(apt => {
                const appointmentDate = new Date(apt.startDate);
                return appointmentDate >= dayStart && appointmentDate <= dayEnd;
              });
              
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

  getWeekDays(date: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(date);
    current.setDate(current.getDate() - current.getDay()); // Start with Sunday
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.calendarService.isSameDay(date, today);
  }

  getAppointmentTop(appointment: Appointment): number {
    const startHour = appointment.startDate.getHours();
    const startMinute = appointment.startDate.getMinutes();
    return (startHour * 48) + (startMinute / 60 * 48);
  }

  getAppointmentHeight(appointment: Appointment): number {
    const start = appointment.startDate.getTime();
    const end = appointment.endDate.getTime();
    const durationHours = (end - start) / (1000 * 60 * 60);
    return Math.max(48 * durationHours, 24); // Minimum height of 24px
  }

  onAppointmentClick(event: Event, appointment: Appointment): void {
    event.stopPropagation();
    this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: { appointment }
    });
  }

  onTimeSlotClick(event: MouseEvent, date: Date): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    
    // Calculate hour based on click position
    const hourClicked = Math.floor(y / 48);
    
    const newDate = new Date(date);
    newDate.setHours(hourClicked);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    
    const endDate = new Date(newDate);
    endDate.setHours(endDate.getHours() + 1);
    
    this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: { date: newDate }
    });
  }
}