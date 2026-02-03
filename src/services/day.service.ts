import { Hour, HourUpdate, AvailableTimesResponse, BotFormattedHours } from "../interfaces";
import { appointmentRepository, hourRepository } from "../repositories";
import { HttpError, dateToMinutes, hasCollision, minutesToHHmm } from "../utils";
import { DayOfWeek } from "../utils/enums";

class HourService {
    async getAllDay(): Promise<Hour[]> {
        const allDays: Hour[] = await hourRepository.getAllHour();

        if (!allDays || allDays.length === 0) {
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Nenhum horário encontrado',
                code: 404,
            });
        }

        return allDays;
    }

    async getByDayOfWeekEnum(dayOfWeek: DayOfWeek, date: string, serviceDuration: number, professionalId?: string) {
        // Busca o OpeningHours pelo dayOfWeek (adicione método no repository: getByDayOfWeek)
        const hours = await hourRepository.getByDayOfWeek(dayOfWeek);

        if (!hours) {
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Horários não configurados para este dia',
                code: 404,
            });
        }

        // Reusa lógica de getByDayOfWeek (ajuste para usar hours.id internamente se necessário)
        return await this.getByDayOfWeek(hours.id, date, serviceDuration, professionalId);
    }
    async getAllForBot(): Promise<BotFormattedHours> {
        const allDays = await this.getAllDay();
        let formattedString = 'Horários de funcionamento:\n\n';

        allDays.forEach(day => {
            if (day.dayClosed) {
                formattedString += `${day.dayOfWeek}: Fechado\n`;
            } else {
                const open = minutesToHHmm(day.openInMinutes);
                const close = minutesToHHmm(day.closeInMinutes);
                const lunchStart = minutesToHHmm(day.openIntervalInMinutes);
                const lunchEnd = minutesToHHmm(day.closeIntervalInMinutes);
                formattedString += `${day.dayOfWeek}: ${open} às ${close} (Intervalo: ${lunchStart} às ${lunchEnd})\n`;
            }
        });

        return { formattedString };
    }

    async getByDayOfWeek(dayId: string, date: string, serviceDuration: number, professionalId?: string): Promise<AvailableTimesResponse> {
        const getDay = await hourRepository.getByIdDay(dayId);

        if (!getDay) {
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Dia não encontrado',
                code: 404,
            });
        }

        if (getDay.dayClosed) {
            return {
                day: getDay.dayOfWeek,
                availableTimes: [],
                dayClosed: true,
            };
        }

        // Filtra appointments por data e professional (para bot/web)
        const appointmentsOfDay = await appointmentRepository.getByAppointmentDate(date, professionalId) || [];

        const busySlots = appointmentsOfDay.map(app => {
            const start = dateToMinutes(new Date(app.date));
            return {
                start,
                end: start + app.duration,
            };
        });

        const availableTimes: string[] = [];
        const step = serviceDuration;

        for (
            let currentTime = getDay.openInMinutes;
            currentTime + serviceDuration <= getDay.closeInMinutes;
            currentTime += step
        ) {
            const slotEnd = currentTime + serviceDuration;

            const isLunchTime = currentTime < getDay.closeIntervalInMinutes && slotEnd > getDay.openIntervalInMinutes;
            if (isLunchTime) continue;

            if (!hasCollision(currentTime, slotEnd, busySlots)) {
                availableTimes.push(minutesToHHmm(currentTime));
            }
        }

        return {
            day: getDay.dayOfWeek,
            availableTimes,
            dayClosed: false,
        };
    }

    async updateDay(dayId: string, day: HourUpdate): Promise<Hour> {
        const verifyDay = await hourRepository.getByIdDay(dayId);

        if (!verifyDay) {
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Dia não encontrado',
                code: 404,
            });
        }

        const updated = await hourRepository.updateDay(dayId, day);

        if (!updated) {
            throw new HttpError({
                title: 'BAD_REQUEST',
                detail: 'Erro ao atualizar dia',
                code: 400,
            });
        }

        return updated;
    }
}

export default new HourService();