import { IDayOfWeek } from "../utils/enums";

export interface Hour {
    id: string;
    dayOfWeek: IDayOfWeek;
    dayClosed: boolean;
    openingInMinutes: number;
    closeInMinutes: number;
    openIntervalInMinutes: number;
    closeIntervalInMinutes: number;
}

export interface HourUpdate {
    dayClosed?: boolean;
    openingInMinutes?: number;
    closeInMinutes?: number;
    openIntervalInMinutes?: number;
    closeIntervalInMinutes?: number;
}