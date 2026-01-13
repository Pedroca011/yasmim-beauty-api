import { Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils";
import { TokenPayload } from "../interfaces";
import { IRoleName } from "../utils/enums";

export const authorize = (allowedRoles: IRoleName[]) => {
  return (req: Request, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      throw new HttpError({
        title: "UNAUTHORIZED",
        detail: "Token não fornecido.",
        code: 401,
      });

    const [, token] = authHeader.split(" ");

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      if (!allowedRoles.includes(decoded.role))
        throw new HttpError({
          title: "FORBIDDEN",
          detail: "Acesso negado: permissão insuficiente",
          code: 403,
        });

      req.user = decoded;

      return next();
    } catch (error) {
      throw new HttpError({
        title: "UNAUTHORIZED",
        detail: "Token inválido ou expirado",
        code: 401,
      });
    }
  };
};
