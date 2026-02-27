import { StatusAppointment } from "../utils/enums";

export interface ICreateAppointment {
  clientId: string;
  professionalId: string;
  serviceIds: string[];
  date: Date | string;
  duration: number;
  totalPrice: number;
}

export interface IUpdateAppointment {
  date?: Date | string;
  duration?: number;
  status?: StatusAppointment;
  canceledById?: string;
  canceledAt?: Date;
}
