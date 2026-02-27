import { appointmentRepository, botRepository } from "../repositories";
import {
  appointmentService,
  hourService,
  productService,
  userService,
  whatsappService,
} from "../services";
import { DayOfWeek, StatusAppointment } from "../utils/enums";
import { BotSessionData } from "../interfaces";

class BotService {
  async handleMessage(inputs: {
    remoteJid: string;
    pushName: string;
    message: string;
    fromMe: boolean;
  }) {
    const { remoteJid, pushName, message, fromMe } = inputs;

    console.log(
      "[BOT SERVICE] Mensagem recebida:",
      message?.toLowerCase()?.trim(),
    );

    // Ignora mensagens do bot (fromMe: true)
    if (fromMe === true) {
      console.log("[BOT SERVICE] Ignorando mensagem enviada pelo bot");
      return null;
    }

    // Ignora mensagens vazias ou não-text
    if (!message || typeof message !== "string" || message.trim() === "") {
      console.log("[BOT SERVICE] Ignorando mensagem vazia ou não-text");
      return null;
    }

    // Normaliza a mensagem aqui (movido para cima para usar nas validações)
    const normalizedMessage = message.toLowerCase().trim().replace(/\s+/g, "");
    console.log("[BOT SERVICE] Mensagem normalizada:", normalizedMessage);

    const phone = remoteJid.split("@")[0];
    const adminPhone = process.env.ADMIN_PHONE;
    // Verifica se é o admin e se mandou "admin"
    if (phone === adminPhone && normalizedMessage === "admin") {
      const upcoming = await appointmentRepository.findUpcomingAppointments();
      if (upcoming.length === 0) {
        return "Nenhum agendamento futuro encontrado.";
      }

      const list = upcoming
        .map((a) => {
          const date = a.date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          const client = a.client.name;
          const services = a.services.map((s) => s.name).join(", ");
          return `${date} - ${client}\n   ✂️ ${services} \n\n`;
        })
        .join("\n\n");

      return `*Agendamentos Futuros:*\n\n${list}`;
    }

    let user = await userService.findByPhone(phone);
    if (!user) {
      user = await userService.signUp({
        name: pushName || "Usuário WhatsApp",
        phone,
        source: "WHATSAPP",
      });
    }

    let session = await botRepository.findSessionByRemoteJid(remoteJid);
    const now = new Date();
    const expireTime = new Date(now.getTime() + 30 * 60 * 1000);

    if (!session || now > new Date(session.expiresAt)) {
      session = await botRepository.upsertSession(
        remoteJid,
        "initial",
        {},
        expireTime,
      );
    }

    const sessionData: BotSessionData =
      (session.data as unknown as BotSessionData) || { step: "initial" };

    // Ignora TODAS as mensagens de grupo
    if (remoteJid.endsWith("@g.us")) {
      console.log("[BOT SERVICE] Ignorando mensagem de grupo");
      return null;
    }

    if (normalizedMessage.startsWith("cancelar")) {
      console.log("[BOT SERVICE] Iniciando fluxo de cancelamento");
      const appointments = await appointmentRepository.findByClientId(user.id);
      const activeAppointments = appointments.filter(
        (a) => a.status !== StatusAppointment.CANCELED,
      );

      if (activeAppointments.length === 0) {
        return "Você não tem agendamentos ativos para cancelar.";
      }

      const list = activeAppointments
        .map((a) => {
          const day = a.date.getDate().toString().padStart(2, "0");
          const month = (a.date.getMonth() + 1).toString().padStart(2, "0");
          const dateStr = `${day}-${month}`; // DD-MM para combinar com o formato de entrada
          const timeStr = a.date.toLocaleTimeString().slice(0, 5); // HH:MM
          return `- ${dateStr} às ${timeStr}`;
        })
        .join("\n");

      sessionData.step = "cancel_select";
      await botRepository.updateSession(
        remoteJid,
        "cancel_select",
        sessionData,
        expireTime,
      );

      return `Seus agendamentos ativos:\n\n${list}\n\nInforme a data e horário para cancelar (ex: 13-02 14:00).`;
    }

    switch (normalizedMessage) {
      case "agendar":
      case "start":
        console.log("[BOT SERVICE] Entrou no case agendar/start");
        const products = await productService.getAllProduct();
        const list = products
          .map(
            (p, i) =>
              `${i + 1}. ${p.name} \n   R$ ${p.currentPrice.toFixed(2)}`,
          )
          .join("\n\n");

        sessionData.step = "service";
        await botRepository.updateSession(
          remoteJid,
          "service",
          sessionData,
          expireTime,
        );

        return `Olá ${pushName}, seja bem-vindo(a) ao atendimento automático do estúdio *Yasmim Beauty*! \n\n*Serviços disponíveis:*\n\n${list}\n\nSelecione um ou mais serviços abaixo escrevendo um ou mais números Ex: ( 1,2,3,4...)`;

      default:
        if (normalizedMessage === "#sair") {
          await botRepository.deleteSession(remoteJid);
          return "Sessão cancelada. Até logo!";
        }

        if (sessionData.step !== "initial") {
          if (sessionData.step === "service") {
            if (normalizedMessage.match(/^\d+(,\d+)*$/)) {
              const serviceIndexes = normalizedMessage
                .split(",")
                .map((n) => parseInt(n, 10) - 1);
              const services = await productService.getAllProduct();
              const selectedServices = serviceIndexes
                .map((i) => services[i])
                .filter((s) => s);
              if (selectedServices.length > 0) {
                sessionData.serviceIds = selectedServices.map((s) => s.id);
                sessionData.step = "date";
                await botRepository.updateSession(
                  remoteJid,
                  "date",
                  sessionData,
                  expireTime,
                );

                const totalDuration = selectedServices.reduce(
                  (sum, s) => sum + s.duration,
                  0,
                );

                const hours = Math.floor(totalDuration / 60);
                const minutes = totalDuration % 60;
                const durationText =
                  hours > 0 ? `${hours}h ${minutes}min ` : `${minutes}min`;

                return `Serviço(s) selecionado(s): \n\n - ${selectedServices.map((s) => s.name).join("\n - ")} \n\n (Duração total: ${durationText}). \n\n Agora, informe a data (ex: 13-02 ou 13/02).`;
              } else {
                return "Número de serviço inválido. Selecione números válidos dos serviços listados, ex: 1,2.";
              }
            } else {
              return "Formato inválido. Informe os números dos serviços separados por vírgula, ex: 1,2.";
            }
          } else if (sessionData.step === "date") {
            if (
              normalizedMessage.match(/^\d{2}-\d{2}$/) ||
              normalizedMessage.match(/^\d{2}\/\d{2}$/)
            ) {
              if (!sessionData.serviceIds) {
                return 'Erro na sessão. Reinicie com "agendar".';
              }
              const [day, month] = normalizedMessage.split(/[-\/]/).map(Number);
              let year = now.getFullYear();
              let targetDate = new Date(year, month - 1, day);

              if (
                targetDate.getMonth() !== month - 1 ||
                targetDate.getDate() !== day
              ) {
                return "Data inválida. Informe uma data válida no formato dia-mês (ex: 13-02 ou 13/02).";
              }

              // Se data já passou, assume próximo ano
              if (targetDate < now) {
                return "Data inválida. Informe uma data válida no formato dia-mês (ex: 13-02 ou 13/02).";
              }

              const fullDateStr = targetDate.toISOString().split("T")[0];

              const services = await Promise.all(
                sessionData.serviceIds.map((id) => productService.getById(id)),
              );
              const totalDuration = services.reduce(
                (sum, s) => sum + s.duration,
                0,
              );
              const dayNumber = targetDate.getDay();
              const dayOfWeekEnum = this.mapDayNumberToEnum(dayNumber);

              const hours = await hourService.getByDayOfWeekEnum(
                dayOfWeekEnum,
                fullDateStr,
                totalDuration,
              );

              if (hours.dayClosed) {
                return "Desculpe, estamos fechados nesse dia. Escolha outra data.";
              } else if (hours.availableTimes.length === 0) {
                return "Nenhum horário disponível nessa data. Tente outra.";
              } else {
                sessionData.date = fullDateStr;
                sessionData.step = "time";
                await botRepository.updateSession(
                  remoteJid,
                  "time",
                  sessionData,
                  expireTime,
                );
                const dateFormat = targetDate.toLocaleDateString("pt-BR");

                return `Data selecionada: ${dateFormat}. Horários disponíveis:\n${hours.availableTimes.join("\n")}\n\nInforme a hora (ex: 14:00).`;
              }
            } else {
              return "Formato de data inválido. Informe dia-mês, ex: 13-02.";
            }
          } else if (sessionData.step === "time") {
            if (normalizedMessage.match(/^\d{2}:\d{2}$/)) {
              if (!sessionData.serviceIds || !sessionData.date) {
                return 'Erro na sessão. Reinicie com "agendar".';
              }

              const professionalId = process.env.PROFESSIONAL_ID;
              const services = await Promise.all(
                sessionData.serviceIds.map((id) => productService.getById(id)),
              );
              const totalDuration = services.reduce(
                (sum, s) => sum + s.duration,
                0,
              );

              // Recalcular horários disponíveis para validar a entrada do usuário
              const [y, m, d] = sessionData.date.split("-").map(Number);
              const dateObj = new Date(y, m - 1, d);
              const dayOfWeekEnum = this.mapDayNumberToEnum(dateObj.getDay());

              const hours = await hourService.getByDayOfWeekEnum(
                dayOfWeekEnum,
                sessionData.date,
                totalDuration,
              );

              // Validar se o horário escolhido está na lista de horários disponíveis
              if (!hours.availableTimes.includes(normalizedMessage)) {
                return "Horário inválido. Escolha um horário disponível.";
              }

              const fullDateStr = `${sessionData.date}T${normalizedMessage}:00`;
              const fullDate = new Date(fullDateStr);

              const totalPrice = services.reduce(
                (sum, s) => sum + s.currentPrice.toNumber(),
                0,
              );
              const isAvailable = await appointmentService.checkAvailability(
                professionalId,
                fullDate,
                totalDuration,
              );

              if (!isAvailable) {
                return "Horário não disponível. Escolha outro.";
              }

              const appointment = await appointmentService.create({
                clientId: user.id,
                professionalId,
                serviceIds: sessionData.serviceIds,
                date: fullDate,
                duration: totalDuration,
                totalPrice
              });

              // formatar data e horario para não ficar com :00 a mais no final
              const dataFormatada = fullDate.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const resumo = `*Agendamento realizado com sucesso!* \n\nAgradecemos pela sua preferência em nosso estúdio!\n\n*Resumo do agendamento:*\n\n${services.map((s) => `- ${s.name}: R$ ${s.currentPrice.toFixed(2)}`).join("\n")}\n\n*Data e horário:* ${dataFormatada}\n\n*Total:* R$ ${totalPrice.toFixed(2)}`;

              // Notificar admin
              const adminMessage = `🔔 *Novo Agendamento*\n\nCliente: ${user.name}\nServiços: ${services.map((s) => s.name).join(", ")}\nData: ${dataFormatada}\nValor: R$ ${totalPrice.toFixed(2)}`;
              await whatsappService.sendText(
                `${adminPhone}@s.whatsapp.net`,
                adminMessage,
              );

              await botRepository.deleteSession(remoteJid);
              return resumo;
            } else {
              return "Formato de hora inválido. Informe HH:MM, ex: 14:00.";
            }
          } else if (sessionData.step === "cancel_select") {
            const cleanMessage = message.toLowerCase().trim();
            // Verifica formato "DD-MM HH:MM"
            if (cleanMessage.match(/^\d{2}-\d{2}\s+\d{2}:\d{2}$/)) {
              const [datePart, timePart] = cleanMessage
                .split(/\s+/)
                .filter(Boolean);
              const [day, month] = datePart.split("-").map(Number);
              let year = now.getFullYear();
              let targetDate = new Date(
                year,
                month - 1,
                day,
                ...timePart.split(":").map(Number),
              );

              if (
                targetDate.getMonth() !== month - 1 ||
                targetDate.getDate() !== day
              ) {
                return "Data ou horário inválido. Informe no formato DD-MM HH:MM, ex: 13-02 14:00.";
              }

              if (targetDate < now) {
                targetDate = new Date(
                  year + 1,
                  month - 1,
                  day,
                  ...timePart.split(":").map(Number),
                );
              }

              // Aqui está o erro: o método retorna ARRAY, então tratamos como tal
              const appointments =
                await appointmentRepository.findByClientAndDate(
                  user.id,
                  targetDate,
                );

              // Verifica se encontrou pelo menos um e se não está cancelado
              const activeAppointment = appointments.find(
                (a) => a.status !== StatusAppointment.CANCELED,
              );

              if (!activeAppointment) {
                return "Agendamento não encontrado para essa data e horário. Tente novamente ou digite #sair.";
              }

              // Pega o agendamento ativo encontrado
              const appointment = activeAppointment;

              sessionData.cancelAppointmentId = appointment.id;
              sessionData.step = "cancel_confirm";
              await botRepository.updateSession(
                remoteJid,
                "cancel_confirm",
                sessionData,
                expireTime,
              );

              return `Agendamento encontrado para ${targetDate.toLocaleString()}. Tem certeza que quer cancelar? Digite "sim" para confirmar ou qualquer outra coisa para abortar.`;
            } else {
              return "Formato inválido. Informe data e horário, ex: 13-02 14:00.";
            }
          } else if (sessionData.step === "cancel_confirm") {
            console.log("[BOT SERVICE] Entrou no step cancel_confirm");
            if (normalizedMessage === "sim") {
              const appointmentId = sessionData.cancelAppointmentId;
              if (!appointmentId) {
                return 'Erro na sessão. Reinicie com "cancelar".';
              }
              const appointment =
                await appointmentRepository.findAppointmentById(appointmentId);
              const status = StatusAppointment.CANCELED;
              await appointmentRepository.update(appointmentId, { status });
              await botRepository.deleteSession(remoteJid);

              // Notificar admin
              if (appointment) {
                const dateFormatted = appointment.date.toLocaleString("pt-BR");
                const adminMessage = `🚫 *Agendamento Cancelado*\n\nCliente: ${user.name}\nData: ${dateFormatted}`;
                await whatsappService.sendText(
                  `${adminPhone}@s.whatsapp.net`,
                  adminMessage,
                );
              }

              return "Agendamento cancelado com sucesso. Agradecemos pela notificação!";
            } else {
              await botRepository.deleteSession(remoteJid);
              return "Cancelamento abortado. Até logo!";
            }
          } else {
            return null;
          }
        } else {
          console.log(
            "[BOT SERVICE] Mensagem ignorada: não é comando de início nem sessão ativa",
          );
          return null;
        }
    }
  }
  catch(error: any) {
    console.error("[BOT SERVICE] Erro geral:", error);
    return "Erro ao processar. Tente novamente.";
  }

  private mapDayNumberToEnum(dayNumber: number): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[dayNumber];
  }
}

export default new BotService();
