import { Hour, HourUpdate } from "../interfaces";
import { appointmentRepository, hourRepository } from "../repositories";
import { HttpError, dateToMinutes, hasCollision, minutesToHHmm } from "../utils";

class HourService {
    async getAllDay() {
        const allDay: Hour[] = await hourRepository.getAllHour();

        if (!allDay)
            throw new HttpError({
                title: 'BAD_REQUEST',
                detail: 'Erro ao buscar dias',
                code: 400,
            });

        return allDay;

    }

    async getByDayOfWeek(dayId: string, date: string, serviceDuration: number) {

        const getDay = await hourRepository.getByIdDay(dayId);

        if (!getDay)
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Dia não encontrado',
                code: 404
            });

        if (getDay.dayClosed === true) throw new HttpError({
            title: 'BAD_REQUEST',
            detail: 'Dia sem funcionamento',
            code: 400
        });


        const appointmentsOfDay = await appointmentRepository.getByAppointmentDate(date) || [];

        const busySlots = appointmentsOfDay.map(app => {
            const start = dateToMinutes(new Date(app.date));
            return {
                start,
                end: start + app.duration
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
            availableTimes
        };
    }

    async updateDay(dayId: string, day: HourUpdate) {
        const verfifyDay = await hourRepository.getByIdDay(dayId);

        if (!verfifyDay)
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Dia não encontrado',
                code: 404
            });

        const update = await hourRepository.updateDay(dayId, day);

        if (!update)
            throw new HttpError({
                title: 'BAD_REQUEST',
                detail: 'Erro ao atualizar dia.',
                code: 400
            });
        return update;
    }
}

export default new HourService();