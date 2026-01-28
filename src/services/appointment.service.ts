import { ICreateAppointment, IUpdateAppointment } from "../interfaces";
import { appointmentRepository } from "../repositories";
import { dateToMinutes, hasCollision } from "../utils";
import { StatusAppointment } from "../utils/enums";

class AppointmentService {
    async checkAvailability(professionalId: string, date: Date | string, duration: number): Promise<boolean> {
        const targetDate = new Date(date);
        const dateString = targetDate.toISOString().split('T')[0];

        // Busca agendamentos do dia para o profissional específico
        const appointments = await appointmentRepository.getByAppointmentDate(dateString, professionalId);

        // Converte o horário desejado para minutos
        const startMinutes = dateToMinutes(targetDate);
        const endMinutes = startMinutes + duration;

        // Verifica colisão
        const hasConflict = hasCollision(startMinutes, endMinutes, appointments.map(app => ({
            start: dateToMinutes(new Date(app.date)),
            end: dateToMinutes(new Date(app.date)) + app.duration
        })));

        return !hasConflict;
    }

    async create(data: ICreateAppointment) {
        // Verifica disponibilidade (agora com professionalId)
        const isAvailable = await this.checkAvailability(data.professionalId, data.date, data.duration);
        if (!isAvailable) {
            throw new Error("Horário indisponível para este profissional");
        }

        return await appointmentRepository.create(data);
    }

    async getOne(id: string) {
        const appointment = await appointmentRepository.findById(id);
        if (!appointment) throw new Error("Agendamento não encontrado");
        return appointment;
    }

    async listAll() {
        return await appointmentRepository.findAll();
    }

    async update(id: string, data: IUpdateAppointment) {
        // Se alterando date/duration, verificar disponibilidade novamente (opcional, adicione se necessário)
        if (data.date || data.duration) {
            const existing = await this.getOne(id);
            const checkDate = data.date || existing.date;
            const checkDuration = data.duration || existing.duration;
            const isAvailable = await this.checkAvailability(existing.professionalId, checkDate, checkDuration);
            if (!isAvailable) {
                throw new Error("Novo horário indisponível");
            }
        }

        return await appointmentRepository.update(id, data);
    }

    async cancel(id: string, userId: string) {
        return await appointmentRepository.update(id, {
            status: StatusAppointment.CANCELED,
            canceledById: userId,
            canceledAt: new Date() // Adicionei aqui para consistência
        });
    }

    async delete(id: string) {
        return await appointmentRepository.delete(id);
    }
}

export default new AppointmentService();