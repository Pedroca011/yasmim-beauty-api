import { DayOfWeek } from "../utils/enums";

export interface Hour {
  id: string;
  dayOfWeek: DayOfWeek;
  dayClosed: boolean;
  openInMinutes: number;
  closeInMinutes: number;
  openIntervalInMinutes: number; 
  closeIntervalInMinutes: number;
}

export interface HourUpdate {
  dayClosed?: boolean;
  openInMinutes?: number;
  closeInMinutes?: number;
  openIntervalInMinutes?: number;
  closeIntervalInMinutes?: number;
}

export interface AvailableTimesResponse {
  day: DayOfWeek;
  availableTimes: string[];
  dayClosed?: boolean;
}


export interface BotFormattedHours {
  formattedString: string; 
}