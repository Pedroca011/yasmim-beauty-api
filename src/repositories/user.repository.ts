import PrismaAdapter from "../config/prisma";
import { IUserCreate } from "../interfaces/user";
import Logging from "../library/Logging";

class userRepository {
  private prisma = PrismaAdapter;

  async getByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      Logging.warn("Erro ao procurar email.");
      return null;
    }
  }

  async createUser({
    name,
    email,
    passwordHashed,
    phone,
    source,
  }: IUserCreate & { source?: "WEB" | "WHATSAPP" }) {
    const createdUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHashed,
        role: "USER",
        phone,
        source: source || "WEB", // Adicionado: Default para 'WEB' se não fornecido
      },
    });

    return createdUser;
  }

  async findByPhone(phone: string) {
    const foundPhone = await this.prisma.user.findUnique({
      where: { phone },
    });
    return foundPhone;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }
}

export default new userRepository();
