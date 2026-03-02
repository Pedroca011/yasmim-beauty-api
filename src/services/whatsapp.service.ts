import axios from "axios";

class WhatsappService {
  private getEvolutionInstance(): string {
    return process.env.EVOLUTION_INSTANCE_NAME || "studio_bot";
  }

  private getBaseUrl(): string {
    return (process.env.EVOLUTION_API_URL || "http://localhost:8080").replace(
      /\/$/,
      "",
    );
  }

  async sendText(remoteJid: string, text: string) {
    const instance = this.getEvolutionInstance();
    const baseUrl = this.getBaseUrl();
    const number = remoteJid.includes("@")
      ? remoteJid.split("@")[0]
      : remoteJid;

    const payload = {
      number: number,
      text: text.trim(),
    };

    try {
      console.log(
        "[WHATSAPP SERVICE] Enviando texto:",
        JSON.stringify(payload, null, 2),
      );

      const response = await axios.post(
        `${baseUrl}/message/sendText/${instance}`,
        payload,
        {
          headers: {
            apikey: process.env.EVOLUTION_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      console.log(
        "[WHATSAPP SERVICE] Texto enviado com sucesso:",
        response.data,
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[WHATSAPP SERVICE] Erro ao enviar texto:",
        error.response?.data || error.message,
      );
    }
  }

  async sendButtons(
    remoteJid: string,
    title: string,
    description: string,
    footer: string,
    buttons: { title: string; displayText: string; id: string }[],
  ) {
    const instance = this.getEvolutionInstance();
    const baseUrl = this.getBaseUrl();
    const number = remoteJid.includes("@")
      ? remoteJid.split("@")[0]
      : remoteJid;

    const payload = {
      number: number,
      title: title || "Escolha uma opção",
      description: description,
      footer: footer || "Studio Bot",
      buttons: buttons.map((btn, index) => ({
        buttonId: btn.id || `btn_${index + 1}`,
        displayText: btn.displayText || btn.title,
        type: 1,
      })),
    };

    try {
      console.log(
        "[WHATSAPP SERVICE] Enviando botões:",
        JSON.stringify(payload, null, 2),
      );

      const response = await axios.post(
        `${baseUrl}/message/sendButtons/${instance}`,
        payload,
        {
          headers: {
            apikey: process.env.EVOLUTION_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      console.log(
        "[WHATSAPP SERVICE] Botões enviados com sucesso:",
        response.data,
      );
      return response.data;
    } catch (error: any) {
      const errorDetail = error.response?.data || error.message;
      console.error("[WHATSAPP SERVICE] Erro ao enviar botões:", errorDetail);

      // Fallback para texto simples
      const fallbackText = `${description}\n\n${buttons.map((b) => b.displayText || b.title).join("\n")}`;
      await this.sendText(remoteJid, fallbackText);
    }
  }
}

export default new WhatsappService();
