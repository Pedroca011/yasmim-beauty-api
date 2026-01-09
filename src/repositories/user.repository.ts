import PrismaAdapter from "../config/prisma";
import { IUser, IUserCreate } from "../interfaces/user";
import Logging from "../library/Logging";
import { HttpError } from "../utils";

class userRepository {
  async getByEmail(email: string) {
    try {
      const user = await PrismaAdapter.user.findUnique({
        where: { email: email },
      });

      return user;
    } catch (error) {
      Logging.warn("Erro ao procurar email.");
      return null;
    }
  }

  async createUser({ name, email, passwordHashed }: IUserCreate) {
    const createUser = await PrismaAdapter.user.create({
      data: {
        name,
        email,
        password: passwordHashed,
        role: 'USER',
      },
    });

    return createUser;
  }
}

export default new userRepository();
