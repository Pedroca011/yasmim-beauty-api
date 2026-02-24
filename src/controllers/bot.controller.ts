import { Request, Response } from "express";
import { botService, whatsappService } from "../services";

class BotController {
  handleWebhook = async (req: Request, res: Response) => {
    console.log(
      "WEBHOOK CHAMADO! Payload recebido:",
      JSON.stringify(req.body, null, 2),
    );

    const event = req.body;

    try {
      if (event.event === "messages.upsert" && event.data?.message) {
        const remoteJid = event.data.key.remoteJid;
        const pushName = event.data.pushName || "Usuário";
        const messageText =
          event.data.message.conversation ||
          event.data.message.extendedTextMessage?.text ||
          "";
        const fromMe = event.data.key.fromMe;

        console.log(
          "Mensagem recebida de:",
          fromMe ? "VOCÊ MESMO" : "OUTRO CONTATO",
        );
        console.log("Texto da mensagem:", messageText);

        const response = await botService.handleMessage({
          remoteJid,
          pushName,
          message: messageText,
          fromMe,
        });

        if (response) {
          await whatsappService.sendText(remoteJid, response);
        }
      } else {
        console.log(
          "Evento ignorado (não é messages.upsert ou sem message):",
          event.event,
        );
      }
    } catch (error) {
      console.error("Erro no webhook:", error);
    }

    return res.status(200).send();
  };
}

export default new BotController();
