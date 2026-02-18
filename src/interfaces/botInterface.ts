export interface BotSessionData {
    step: 'initial' | 'service' | 'date' | 'time' | 'cancel_select' | 'cancel_confirm';
    serviceIds?: string[];
    date?: string;
    cancelAppointmentId?: string;
}