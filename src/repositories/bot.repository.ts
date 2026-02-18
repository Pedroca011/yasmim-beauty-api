import PrismaAdapter from "../config/prisma";

class BotRepository {
  private prisma = PrismaAdapter;

  async findSessionByRemoteJid(remoteJid: string) {
    return await this.prisma.botSession.findUnique({ where: { remoteJid } });
  }

  async upsertSession(
    remoteJid: string,
    step: string,
    data: object,
    expiresAt: Date,
  ) {
    return await this.prisma.botSession.upsert({
      where: { remoteJid },
      create: {
        remoteJid,
        step,
        data,
        expiresAt,
      },
      update: {
        step,
        data,
        expiresAt,
      },
    });
  }

  async updateSession(
    remoteJid: string,
    step: string,
    data: object,
    expiresAt: Date,
  ) {
    return await this.prisma.botSession.update({
      where: { remoteJid },
      data: { step, data, expiresAt },
    });
  }

  async deleteSession(remoteJid: string) {
    return await this.prisma.botSession.delete({ where: { remoteJid } });
  }
}

export default new BotRepository();
