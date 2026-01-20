import { Request, Response } from "express";
import { hourService } from "../services";
import { Hour } from "../interfaces";

class HourController {
    async getAllDay(res: Response) {
        const service: Hour[] = await hourService.getAllDay();

        return res.status(200).json({
            msg: 'Dias listados com sucesso.',
            day: service,
        })
    }

    async getByIdDay(req: Request, res: Response) { 
        const dayId = req.params.id;

        const service = await hourService.getByIdDay(dayId);

        return res.status(200).json({
            msg: 'Dia listado com sucesso',
            day: service,
        })
    }

    async updateHour(req: Request, res: Response) {
        const dayId = req.params.id;
        const dayBody = req.body;

        const service = await hourService.updateDay(dayId, dayBody);

        return res.status(200).json({
            msg: 'Atualizado com sucesso',
            day: service,
        })
    }

}

export default new HourController();