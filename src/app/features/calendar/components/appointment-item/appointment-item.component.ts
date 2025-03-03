// src/app/features/calendar/components/appointment-item/appointment-item.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { Appointment } from '../../../../core/models/appointment';

@Component({
  selector: 'app-appointment-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './appointment-item.component.html',
  styleUrls: ['./appointment-item.component.scss']
})
export class AppointmentItemComponent {
  @Input() appointment!: Appointment;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {}

  deleteAppointment(event: Event): void {
    event.stopPropagation();
    this.appointmentService.deleteAppointment(this.appointment.id);
  }

  editAppointment(event: Event): void {
    event.stopPropagation();
    this.dialog.open(AppointmentFormComponent, {
      width: '400px',
      data: { appointment: this.appointment }
    });
  }

  getTimeString(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}