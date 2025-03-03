export interface Appointment {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    color?: string;
}
