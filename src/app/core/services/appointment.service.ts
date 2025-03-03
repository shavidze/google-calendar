import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from '../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  public appointments$ = this.appointmentsSubject.asObservable();
  
  constructor() { }

  private loadAppointments(): void {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments) as Appointment[];
      // Convert string dates back to Date objects
      const parsedAppointments = appointments.map(apt => ({
        ...apt,
        startDate: new Date(apt.startDate),
        endDate: new Date(apt.endDate)
      }));
      this.appointmentsSubject.next(parsedAppointments);
    }
  }

  private saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  addAppointment(appointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const newAppointment = {
      ...appointment,
      id: this.generateId()
    };
    const updatedAppointments = [...currentAppointments, newAppointment];
    this.appointmentsSubject.next(updatedAppointments);
    this.saveAppointments(updatedAppointments);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const updatedAppointments = currentAppointments.map(apt => 
      apt.id === updatedAppointment.id ? updatedAppointment : apt
    );
    this.appointmentsSubject.next(updatedAppointments);
    this.saveAppointments(updatedAppointments);
  }

  deleteAppointment(id: string): void {
    const currentAppointments = this.appointmentsSubject.getValue();
    const updatedAppointments = currentAppointments.filter(apt => apt.id !== id);
    this.appointmentsSubject.next(updatedAppointments);
    this.saveAppointments(updatedAppointments);
  }
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  }

  // Calendar specific functions
  getAppointmentsForDate(date: Date): Observable<Appointment[]> {
    return new Observable<Appointment[]>(observer => {
      this.appointments$.subscribe(appointments => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const filteredAppointments = appointments.filter(apt => {
          const aptStartDate = new Date(apt.startDate);
          return aptStartDate >= targetDate && aptStartDate < nextDay;
        });
        
        observer.next(filteredAppointments);
      });
    });
  }
}
