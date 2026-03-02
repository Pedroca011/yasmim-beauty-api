import { whatsappService } from ".";
import { ICreateAppointment, IUpdateAppointment } from "../interfaces";
import { appointmentRepository } from "../repositories";
import { dateToMinutes, hasCollision } from "../utils";
import { StatusAppointment } from "../utils/enums";
import userService from "./user.service";

class AppointmentService {
  async checkAvailability(
    professionalId: string,
    date: Date | string,
    duration: number,
  ): Promise<boolean> {
    const targetDate = new Date(date);
    const dateString = targetDate.toISOString().split("T")[0];

    // Busca agendamentos do dia para o profissional específico
    const appointments = await appointmentRepository.getByAppointmentDate(
      dateString,
      professionalId,
    );

    // Converte o horário desejado para minutos
    const startMinutes = dateToMinutes(targetDate);
    const endMinutes = startMinutes + duration;

    // Verifica colisão
    const hasConflict = hasCollision(
      startMinutes,
      endMinutes,
      appointments.map((app) => ({
        start: dateToMinutes(new Date(app.date)),
        end: dateToMinutes(new Date(app.date)) + app.duration,
      })),
    );

    return !hasConflict;
  }

  async create(data: ICreateAppointment) {
    // Verifica disponibilidade (agora com professionalId)
    const isAvailable = await this.checkAvailability(
      data.professionalId,
      data.date,
      data.duration,
    );
    if (!isAvailable) {
      throw new Error("Horário indisponível para este profissional");
    }

    return await appointmentRepository.create(data);
  }

  async getOne(id: string) {
    const appointment = await appointmentRepository.findAppointmentById(id);
    if (!appointment) throw new Error("Agendamento não encontrado");
    return appointment;
  }

  async listAll() {
    return await appointmentRepository.findAll();
  }

  async update(id: string, data: IUpdateAppointment) {
    // Se alterando date/duration, verificar disponibilidade novamente
    const existingAppointment = await this.getOne(id);
    if (data.date || data.duration) {
      const checkDate = data.date || existingAppointment.date;
      const checkDuration = data.duration || existingAppointment.duration;
      const isAvailable = await this.checkAvailability(
        existingAppointment.professionalId,
        checkDate,
        checkDuration,
      );
      if (!isAvailable) {
        throw new Error("Novo horário indisponível");
      }
    }

    // Se o admin cancelar o agendamento enviar uma mensagem notificando o user pelo numero
    if (data.status === StatusAppointment.CANCELED) {
      const phone = existingAppointment.client.phone;
      if (phone) {
        const message = `Olá ${existingAppointment.client.name}, \nEstou entrando em contato para notificar que seu agendamento na data de *${existingAppointment.date.toLocaleDateString("pt-BR")}* às *${existingAppointment.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}* foi cancelado.`;
        await whatsappService.sendText(phone, message);
        console.log("Mensagem enviada para o cliente: ", phone);
      }
    }

    return await appointmentRepository.update(id, data);
  }

  async cancel(id: string, userId: string) {
    const existingAppointment = await this.getOne(id);

    const updated = await appointmentRepository.update(id, {
      status: StatusAppointment.CANCELED,
      canceledById: userId,
      canceledAt: new Date(),
    });

    const userCanceling = await userService.findById(userId);

    // Se a role de quem cancela for ADMIN ou PROFESSIONAL, notifica o cliente
    if (
      userCanceling &&
      (userCanceling.role === "ADMIN" || userCanceling.role === "PROFESSIONAL")
    ) {
      const phone = existingAppointment.client.phone;
      if (phone) {
        const message = `Olá ${existingAppointment.client.name}, \nEstou entrando em contato para notificar que seu agendamento na data de *${existingAppointment.date.toLocaleDateString("pt-BR")}* às *${existingAppointment.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}* foi cancelado.`;
        await whatsappService.sendText(phone, message);
        console.log(
          "Mensagem enviada para o cliente via cancel endpoint: ",
          phone,
        );
      }
    } else {
      // Caso contrário (é o próprio usuário cancelando), notifica o ADMIN
      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        const message = `🚫 *Agendamento Cancelado pelo cliente*\n\nCliente: ${existingAppointment.client.name}\nData: ${existingAppointment.date.toLocaleDateString("pt-BR")} às ${existingAppointment.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
        await whatsappService.sendText(`${adminPhone}@s.whatsapp.net`, message);
      }
    }

    return updated;
  }

  async delete(id: string) {
    return await appointmentRepository.deleteAppointment(id);
  }
}

export default new AppointmentService();
