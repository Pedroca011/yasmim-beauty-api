export interface BotSessionData {
    step: 'initial' | 'service' | 'date' | 'time';
    serviceId?: string;
    date?: string;
  }