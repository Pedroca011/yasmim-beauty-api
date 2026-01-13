import { Request, Response } from "express";
import { authService } from "../services";

class AuthControlelr {
  async signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    console.log(email, password)

    const userSignIn = await authService.signIn({ email, password });

    return res.status(200).json({
      access_token: userSignIn,
    });
  }
}

export default new AuthControlelr();
