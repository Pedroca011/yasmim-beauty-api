import { IRoleName } from "../utils/enums";

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: IRoleName;
}

export interface IUserCreate extends Omit<IUser, 'password' | 'role'> {
    passwordHashed: string
}