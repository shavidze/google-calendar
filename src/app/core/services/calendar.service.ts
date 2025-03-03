// src/app/core/services/calendar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private currentDateSubject = new BehaviorSubject<Date>(new Date());
  currentDate$ = this.currentDateSubject.asObservable();

  constructor() {}

  setCurrentDate(date: Date): void {
    this.currentDateSubject.next(date);
  }

  getCurrentDate(): Observable<Date> {
    return this.currentDate$;
  }

  // Generate days for a month view
  getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Get the first day to display (might be from previous month)
    const firstDayToDisplay = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    firstDayToDisplay.setDate(firstDayToDisplay.getDate() - dayOfWeek);
    
    // Generate 42 days (6 weeks) to ensure we have enough days
    const current = new Date(firstDayToDisplay);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  // Navigate to next month
  nextMonth(): void {
    const current = this.currentDateSubject.getValue();
    const nextMonth = new Date(current);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.currentDateSubject.next(nextMonth);
  }

  // Navigate to previous month
  previousMonth(): void {
    const current = this.currentDateSubject.getValue();
    const prevMonth = new Date(current);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    this.currentDateSubject.next(prevMonth);
  }

  // Navigate to next week
  nextWeek(): void {
    const current = this.currentDateSubject.getValue();
    const nextWeek = new Date(current);
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.currentDateSubject.next(nextWeek);
  }

  // Navigate to previous week
  previousWeek(): void {
    const current = this.currentDateSubject.getValue();
    const prevWeek = new Date(current);
    prevWeek.setDate(prevWeek.getDate() - 7);
    this.currentDateSubject.next(prevWeek);
  }

  // Navigate to next day
  nextDay(): void {
    const current = this.currentDateSubject.getValue();
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);
    this.currentDateSubject.next(nextDay);
  }

  // Navigate to previous day
  previousDay(): void {
    const current = this.currentDateSubject.getValue();
    const prevDay = new Date(current);
    prevDay.setDate(prevDay.getDate() - 1);
    this.currentDateSubject.next(prevDay);
  }

  // Check if two dates are the same day
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}