import { Request, Response } from "express";
import { IUser } from "../interfaces";
import { HttpError } from "../utils";
import { userService } from "../services";

class UserController {
  async singUp(req: Request, res: Response) {
    const { name, email, password }: IUser = req.body;
    console.log(`[DADOS USER CONTROLLER] ${name}, ${email}, ${password}`);

    if (!name || !email || !password)
      throw new HttpError({
        title: "BAD_REQUEST",
        detail: "Credenciais inválidas",
        code: 400,
      });

    const createUser = await userService.singUp({ name, email, password });

    return res.status(201).json({
      msg: "User criado com sucesso",
      user: createUser,
    });
  }
}

export default new UserController();
