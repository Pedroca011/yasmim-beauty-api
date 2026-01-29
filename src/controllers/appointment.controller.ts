import { Request, Response } from "express";
import { appointmentService } from "../services"; 

class AppointmentController {
    async create(req: Request, res: Response) {
        try {
            const { clientId } = req.params;
            const { professionalId, serviceIds, date, duration } = req.body;

            if (!professionalId || !serviceIds?.length || !date || !duration) {
                return res.status(400).json({
                    title: 'DADOS INVÁLIDOS',
                    detail: 'Campos obrigatórios: professionalId, serviceIds, date, duration.'
                });
            }

            const isAvailable = await appointmentService.checkAvailability(professionalId, date, duration);

            if (!isAvailable) {
                return res.status(400).json({
                    title: 'CONFLITO',
                    detail: 'O horário selecionado já está ocupado para este profissional.'
                });
            }

            const appointment = await appointmentService.create({
                clientId,
                professionalId,
                serviceIds,
                date,
                duration
            });

            return res.status(201).json({
                msg: "Agendamento realizado com sucesso",
                appointment
            });
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }

    async show(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const appointment = await appointmentService.getOne(id);
            return res.json(appointment);
        } catch (error: any) {
            return res.status(error.code || 404).json({ detail: error.detail || error.message });
        }
    }

    async list(req: Request, res: Response) {
        const appointments = await appointmentService.listAll();
        return res.json(appointments);
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { date, duration, status } = req.body;

            const updatedAppointment = await appointmentService.update(id, { date, duration, status });
            return res.json({
                msg: "Agendamento atualizado com sucesso",
                appointment: updatedAppointment
            });
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }

    async cancel(req: Request, res: Response) {
        // try {
        //     const { id } = req.params;
        //     const userId = req.user.id;

        //     const canceledAppointment = await appointmentService.cancel(id, userId);
        //     return res.json({
        //         msg: "Agendamento cancelado com sucesso",
        //         appointment: canceledAppointment
        //     });
        // } catch (error: any) {
        //     return res.status(error.code || 500).json({ detail: error.detail || error.message });
        // }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await appointmentService.getOne(id);
            await appointmentService.delete(id);
            return res.status(204).send();
        } catch (error: any) {
            return res.status(error.code || 500).json({ detail: error.detail || error.message });
        }
    }
}

export default new AppointmentController();