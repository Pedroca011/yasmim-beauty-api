import { IRoleName } from "../utils/enums";
import { IUser } from "./user";

export interface TokenPayload {
    id: string;
    user: IUser;
}