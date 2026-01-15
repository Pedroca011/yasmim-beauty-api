/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils";
import { TokenPayload } from "../interfaces";
import { IRoleName } from "../utils/enums";

export const authorize = (allowedRoles: IRoleName[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return next(
        new HttpError({
          title: "UNAUTHORIZED",
          detail: "Token inválido ou expirado",
          code: 401,
        })
      );

    const [, token] = authHeader.split(" ");

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as TokenPayload;
      console.warn('[ROLES ACEITAS]', allowedRoles)
      console.log("[TOKEN DECODED]", decoded);

      if (!allowedRoles.includes(decoded.user.role))
        return next(
          new HttpError({
            title: "FORBIDDEN",
            detail: "Acesso negado: permissão insuficiente",
            code: 403,
          })
        );

      req.user = decoded;

      return next();
    } catch (error) {
      console.error("[JWT ERROR]", error);
      return next(
        new HttpError({
          title: "UNAUTHORIZED",
          detail: "Token não fornecido.",
          code: 401,
        })
      );
    }
  };
};
