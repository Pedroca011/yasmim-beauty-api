import { Hour, HourUpdate } from "../interfaces";
import { hourRepository } from "../repositories";
import { HttpError } from "../utils";

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

    async getByIdDay(dayId: string) {

        const getDay = await hourRepository.getByIdDay(dayId);

        if (!getDay)
            throw new HttpError({
                title: 'NOT_FOUND',
                detail: 'Dia não encontrado',
                code: 404
            });

        return getDay;
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