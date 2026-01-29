import { IUserSignIn } from "../interfaces";
import { HttpError, PasswordCompare } from "../utils";
import { userRepository } from "../repositories";
import jwt from "jsonwebtoken";

class AuthService {
  async signIn({ email, password }: IUserSignIn) {
    const user = await userRepository.getByEmail(email);

    if (!user)
      throw new HttpError({
        title: "UNAUTHORIZED",
        detail: "E-mail ou senha inválidos",
        code: 401,
      });
    const isPasswordValid = await PasswordCompare({
      ReqPassword: password,
      UserPassword: user.password,
    });

    if (!isPasswordValid) {
      throw new HttpError({
        title: "UNAUTHORIZED",
        detail: "E-mail ou senha inválidos",
        code: 401,
      });
    }

    const token = jwt.sign(
      { id: user.id, user: user },
      process.env.JWT_SECRET!,
      {
        expiresIn: "90h",
      }
    );

    return token;
  }
}

export default new AuthService();
