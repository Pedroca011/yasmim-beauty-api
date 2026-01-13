import { IPassword } from "../interfaces";
import bcrypt from "bcrypt";
import HttpError from "./httpError";

export default async function PasswordCompare({
  ReqPassword,
  UserPassword,
}: IPassword) {
  const IMatch = await bcrypt.compare(ReqPassword, UserPassword);

  if(!IMatch) throw new HttpError({
    title: 'UNAUTHORIZED',
    detail: 'Crendenciais inválidas',
    code: 401,
  })

  return IMatch;
}
