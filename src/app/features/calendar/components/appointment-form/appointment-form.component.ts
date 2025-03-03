// src/app/features/calendar/components/appointment-form/appointment-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment } from '../../../../core/models/appointment';

interface ColorOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  isEditMode = false;
  
  colorOptions: ColorOption[] = [
    { value: '#4285f4', viewValue: 'Blue' },
    { value: '#0b8043', viewValue: 'Green' },
    { value: '#d50000', viewValue: 'Red' },
    { value: '#f4511e', viewValue: 'Orange' },
    { value: '#8e24aa', viewValue: 'Purple' },
    { value: '#3949ab', viewValue: 'Indigo' },
    { value: '#039be5', viewValue: 'Light Blue' },
    { value: '#33b679', viewValue: 'Teal' },
    { value: '#e67c73', viewValue: 'Salmon' },
    { value: '#616161', viewValue: 'Gray' }
  ];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    public dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date?: Date; appointment?: Appointment }
  ) {
    // Set default date if provided or use current date
    const startDate = this.data.date || new Date();
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    this.appointmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      startDate: [startDate, Validators.required],
      endDate: [endDate, Validators.required],
      color: [this.colorOptions[0].value]
    });
  }

  ngOnInit(): void {
    if (this.data.appointment) {
      this.isEditMode = true;
      this.appointmentForm.patchValue({
        title: this.data.appointment.title,
        description: this.data.appointment.description,
        startDate: this.data.appointment.startDate,
        endDate: this.data.appointment.endDate,
        color: this.data.appointment.color || this.colorOptions[0].value
      });
    }

    // Validate that end date is after start date
    this.appointmentForm.get('startDate')?.valueChanges.subscribe(startDate => {
      const endDateControl = this.appointmentForm.get('endDate');
      if (endDateControl?.value < startDate) {
        endDateControl?.setValue(startDate);
      }
    });
  }

  getSelectedColorLabel(): string {
    const selectedColor = this.colorOptions.find(o => o.value === this.appointmentForm.get('color')?.value);
    return selectedColor ? selectedColor.viewValue : 'Unknown';
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      return;
    }

    const formValue = this.appointmentForm.value;
    
    if (this.isEditMode) {
      const updatedAppointment: Appointment = {
        ...this.data.appointment!,
        title: formValue.title,
        description: formValue.description,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        color: formValue.color
      };
      this.appointmentService.updateAppointment(updatedAppointment);
    } else {
      const newAppointment: Appointment = {
        id: '', // Will be set in service
        title: formValue.title,
        description: formValue.description,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        color: formValue.color
      };
      this.appointmentService.addAppointment(newAppointment);
    }
    
    this.dialogRef.close();
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onDelete(): void {
    if (this.isEditMode) {
      this.appointmentService.deleteAppointment(this.data.appointment!.id);
      this.dialogRef.close();
    }
  }
}