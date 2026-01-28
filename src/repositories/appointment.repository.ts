import PrismaAdapter from "../config/prisma";
import { ICreateAppointment, IUpdateAppointment } from "../interfaces";

class AppointmentRepository {
    private prisma = PrismaAdapter.appointment;

    async create(data: ICreateAppointment) {
        return await this.prisma.create({
            data: {
                clientId: data.clientId,
                professionalId: data.professionalId,
                date: new Date(data.date),
                duration: data.duration,
                services: {
                    connect: data.serviceIds.map(id => ({ id }))
                }
            },
            include: {
                client: true,
                professional: true,
                services: true
            }
        });
    }

    async findAll() {
        return await this.prisma.findMany({
            include: {
                client: true,
                professional: true,
                services: true
            }
        });
    }

    async findById(id: string) {
        return await this.prisma.findUnique({
            where: { id },
            include: {
                client: true,
                professional: true,
                services: true
            }
        });
    }

    async update(id: string, data: IUpdateAppointment) {
        return await this.prisma.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                canceledAt: data.status === 'CANCELED' ? new Date() : data.canceledAt
            },
            include: {
                client: true,
                professional: true,
                services: true
            }
        });
    }

    async delete(id: string) {
        return await this.prisma.delete({
            where: { id }
        });
    }

    async getByAppointmentDate(date: string, professionalId?: string) {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);

        return await this.prisma.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
                professionalId, // Filtro por professional
                status: "SCHEDULED",
            },
            select: {
                date: true,
                duration: true
            }
        });
    }
}

export default new AppointmentRepository();