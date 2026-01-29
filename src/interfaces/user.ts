import { IRoleName } from "../utils/enums";

export type UserSource = 'WEB' | 'WHATSAPP' | 'APP';

export interface IUser {
  name: string;
  email?: string;
  password?: string;
  role: IRoleName;
  phone?: string;
  source?: UserSource;
}

export interface IUserCreate extends Omit<IUser, "password" | "role"> {
  password?: string;
  passwordHashed?: string;
  phone?: string;
}

export interface IUserSignIn {
  email: string;
  password: string;
}