import { IUser } from "../interfaces";
import { userRepository } from "../repositories";
import { HttpError, PasswordHashed } from "../utils";

class userService {
  async singUp({ name, email, password }: Omit<IUser, "role">) {
    const verifyEmail = await userRepository.getByEmail(email);

    if (verifyEmail)
      throw new HttpError({
        title: "CONFLIT",
        detail: "Email em uso",
        code: 409,
      });

    const passwordHashed = await PasswordHashed(password);

    if (passwordHashed === null)
      throw new HttpError({
        title: "BAD_REQUEST",
        detail: "Email em uso",
        code: 400,
      });

    const createuser = await userRepository.createUser({
      name,
      email,
      passwordHashed,
    });

    return createuser;
  }
}

export default new userService();
