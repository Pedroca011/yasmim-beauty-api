import { Request, Response } from "express";
import { hourService } from "../services";
import { Hour, HourUpdate } from "../interfaces";

class HourController {
    async getAllDay(req: Request, res: Response) {
        try {
            const hours: Hour[] = await hourService.getAllDay();
            return res.status(200).json({
                msg: 'Dias listados com sucesso.',
                days: hours, 
            });
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }

    async getByDayOfWeek(req: Request, res: Response) {
        try {
            const { dayId } = req.params;
            const { date, serviceDuration, professionalId } = req.body; 

            if (!date || !serviceDuration) {
                return res.status(400).json({ detail: "Campos date e serviceDuration são obrigatórios" });
            }

            const available = await hourService.getByDayOfWeek(dayId, date, serviceDuration, professionalId);
            return res.status(200).json({
                msg: 'Dia listado com sucesso',
                day: available,
            });
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }

    async updateDay(req: Request, res: Response) {
        try {
            const { dayId } = req.params;
            const dayBody: HourUpdate = req.body;

            const updated = await hourService.updateDay(dayId, dayBody);
            return res.status(200).json({
                msg: 'Atualizado com sucesso',
                day: updated,
            });
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }

    async getAllForBot(req: Request, res: Response) {
        try {
            const formatted = await hourService.getAllForBot();
            return res.status(200).json({
                msg: 'Horários formatados para bot',
                formatted,
            });
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }
}

export default new HourController();