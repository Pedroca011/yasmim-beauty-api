import { IRoleName } from "../utils/enums";

export interface TokenPayload {
    id: string;
    role: IRoleName;
}