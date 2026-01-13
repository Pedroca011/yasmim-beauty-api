import { IUser } from "../interfaces";
import { userRepository } from "../repositories";
import { HttpError } from "../utils";
import bcrypt from "bcrypt";

class userService {
  async singUp({ name, email, password }: Omit<IUser, "role">) {
    const verifyEmail = await userRepository.getByEmail(email);

    if (verifyEmail)
      throw new HttpError({
        title: "CONFLIT",
        detail: "Email em uso",
        code: 409,
      });

    const saltRounds: number = 10;

    const passwordHashed = await bcrypt.hash(password, saltRounds);

    const createuser = await userRepository.createUser({
      name,
      email,
      passwordHashed,
    });

    return createuser;
  }
}

export default new userService();
