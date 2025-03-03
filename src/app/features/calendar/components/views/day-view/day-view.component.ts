// src/app/features/calendar/components/day-view/day-view.component.ts
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
  selector: 'app-day-view',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    DragDropModule
  ],
  template: `
    <div class="day-view-container">
      <div class="time-labels">
        <div class="time-label" *ngFor="let hour of hours">{{ hour }}</div>
      </div>
      
      <div class="day-content">
        <div class="day-header">
          <div class="day-name">{{ (currentDay$ | async)?.date | date:'EEEE' }}</div>
          <div class="day-number" [class.today]="isToday((currentDay$ | async)?.date)">
            {{ (currentDay$ | async)?.date | date:'d' }}
          </div>
        </div>
        
        <div class="day-grid" (click)="onTimeSlotClick($event)">
          <div class="hour-row" *ngFor="let hour of hours"></div>
          
          <div 
            *ngFor="let appointment of (currentDay$ | async)?.appointments" 
            class="day-appointment"
            [style.top.px]="getAppointmentTop(appointment)"
            [style.height.px]="getAppointmentHeight(appointment)"
            [style.backgroundColor]="appointment.color || '#4285f4'"
            (click)="onAppointmentClick($event, appointment)">
            <div class="appointment-title">{{ appointment.title }}</div>
            <div class="appointment-time">
              {{ appointment.startDate | date:'shortTime' }} - {{ appointment.endDate | date:'shortTime' }}
            </div>
            <div class="appointment-description" *ngIf="appointment.description">
              {{ appointment.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .day-view-container {
      display: flex;
      height: calc(100vh - 64px);
      overflow-y: auto;
      font-family: 'Roboto', sans-serif;
    }

    .time-labels {
      width: 60px;
      border-right: 1px solid #dadce0;
      padding-top: 48px; /* Space for day header */
    }

    .time-label {
      height: 48px;
      padding-right: 8px;
      text-align: right;
      font-size: 10px;
      color: #70757a;
      transform: translateY(-6px);
    }

    .day-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .day-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 48px;
      border-bottom: 1px solid #dadce0;
    }

    .day-name {
      font-size: 12px;
      font-weight: 500;
      color: #70757a;
    }

    .day-number {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #3c4043;
      
      &.today {
        background-color: #1a73e8;
        color: white;
        border-radius: 50%;
      }
    }

    .day-grid {
      flex: 1;
      position: relative;
      cursor: pointer;
    }

    .hour-row {
      height: 48px;
      border-bottom: 1px solid #dadce0;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }

    .day-appointment {
      position: absolute;
      left: 16px;
      right: 16px;
      border-radius: 4px;
      padding: 8px 12px;
      color: white;
      overflow: hidden;
      cursor: pointer;
      
      &:hover {
        box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
      }
    }

    .appointment-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .appointment-time {
      font-size: 12px;
      opacity: 0.85;
      margin-bottom: 8px;
    }

    .appointment-description {
      font-size: 12px;
      white-space: pre-line;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 60px;
    }
  `]
})
export class DayViewComponent implements OnInit {
  hours = [
    '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];
  
  currentDay$: Observable<{ date: Date; appointments: Appointment[] }>;

  constructor(
    private calendarService: CalendarService,
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {
    this.currentDay$ = this.calendarService.currentDate$.pipe(
      switchMap(currentDate => {
        return this.appointmentService.getAppointments().pipe(
          map(allAppointments => {
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            const appointments = allAppointments.filter(apt => {
              const appointmentDate = new Date(apt.startDate);
              return appointmentDate >= dayStart && appointmentDate <= dayEnd;
            });
            
            appointments.sort((a:any, b:any) => 
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
            
            return { date: currentDate, appointments };
          })
        );
      })
    );
  }

  ngOnInit(): void {}

  isToday(date: Date | undefined): boolean {
    if (!date) return false;
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
    return Math.max(48 * durationHours, 32); // Minimum height of 32px
  }

  onAppointmentClick(event: Event, appointment: Appointment): void {
    event.stopPropagation();
    this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: { appointment }
    });
  }

  onTimeSlotClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    
    // Calculate hour based on click position
    const hourClicked = Math.floor(y / 48);
    
    this.currentDay$.subscribe(dayData => {
      const newDate = new Date(dayData.date);
      newDate.setHours(hourClicked);
      newDate.setMinutes(0);
      newDate.setSeconds(0);
      
      const endDate = new Date(newDate);
      endDate.setHours(endDate.getHours() + 1);
      
      this.dialog.open(AppointmentFormComponent, {
        width: '500px',
        data: { date: newDate }
      });
    }).unsubscribe();
  }
}