import { IUser, IUserCreate } from "../interfaces";
import { userRepository } from "../repositories";
import { HttpError, PasswordHashed } from "../utils";

class userService {
  // Renomeado de 'singUp' para 'signUp' (corrigindo typo)
  async signUp({
    name,
    email,
    password,
    phone,
    source = "WEB",
  }: IUserCreate & { source?: "WEB" | "WHATSAPP" }) {
    // Verificações condicionais: só checa email se fornecido, phone se fornecido
    if (email) {
      const verifyEmail = await userRepository.getByEmail(email);
      if (verifyEmail) {
        throw new HttpError({
          title: "CONFLICT", // Corrigido de 'CONFLIT'
          detail: "Email já em uso",
          code: 409,
        });
      }
    }

    if (phone) {
      const verifyPhone = await userRepository.findByPhone(phone);
      if (verifyPhone) {
        throw new HttpError({
          title: "CONFLICT",
          detail: "Telefone já em uso",
          code: 409,
        });
      }
    }

    let passwordHashed: string | undefined;
    if (password) {
      passwordHashed = await PasswordHashed(password);
      if (!passwordHashed) {
        throw new HttpError({
          title: "BAD_REQUEST",
          detail: "Erro ao processar senha",
          code: 400,
        });
      }
    }

    const createdUser = await userRepository.createUser({
      name,
      email,
      passwordHashed,
      phone,
      source,
    });

    return createdUser;
  }

  // Completado: Agora chama o repository e retorna o usuário
  async findByPhone(phone: string) {
    const user = await userRepository.findByPhone(phone);
    return user;
  }

  async findById(id: string) {
    return await userRepository.findById(id);
  }

  // Método extra para bot: Cria ou encontra usuário via WhatsApp (sem email/senha)
  async getOrCreateFromBot({ name, phone }: { name: string; phone: string }) {
    let user = await this.findByPhone(phone);
    if (!user) {
      user = await this.signUp({
        name,
        phone,
        source: "WHATSAPP",
      });
    }
    return user;
  }
}

export default new userService();
