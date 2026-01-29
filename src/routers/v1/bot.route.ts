import { Request, Response, Router } from 'express';
import { appointmentService } from '../../services';  // Seus services existentes
import { productService } from '../../services';  // Assuma que você tem services para cada rota
import { hourService } from '../../services';
import { userService } from '../../services';

const botRouter = Router();

botRouter.post('/bot-handler', async (req: Request, res: Response) => {
    const { apiKey, inputs } = req.body;  // Evolution envia isso

    // Valide API key
    if (apiKey !== process.env.AUTH_TOKEN) {
        return res.status(401).json({ message: 'Acesso negado' });
    }

    const { remoteJid, pushName, message } = inputs;  // Variáveis automáticas: JID (ex: 5511999999999@s.whatsapp.net), nome, mensagem atual do usuário

    // Lógica de estado: Use uma sessão em memória/banco para rastrear etapa (ex: Redis ou DB simples). Aqui, exemplo simples com switch baseado na mensagem.
    let responseMessage = '';

    try {
        // Identifique ou crie usuário baseado no JID/numero WhatsApp (extraia número de remoteJid)
        const phone = remoteJid.split('@')[0];  // Ex: 5511999999999
        let user = await userService.findByPhone(phone);  // Assuma que você adicionou um campo 'phone' no User model
        if (!user) {
            user = await userService.signUp({ name: pushName, email: `${phone}@whatsapp.com`, phone });  // Crie se não existir
        }

        // Fluxo de conversa baseado na mensagem (ex: estado multi-etapa)
        if (message.toLowerCase() === 'agendar') {
            // Etapa 1: Listar serviços
            const services = await productService.getAllProduct();
            responseMessage = 'Olá! Escolha um serviço:\n' + services.map((s, i) => `${i + 1}. ${s.name} - ${s.duration} min`).join('\n');
        } else if (message.match(/^\d+$/)) {  // Ex: usuário escolhe número do serviço
            const serviceIndex = parseInt(message) - 1;
            const services = await productService.getAllProduct();
            const selectedService = services[serviceIndex];
            if (selectedService) {
                // Armazene em sessão (ex: Redis.set(remoteJid, { step: 'date', serviceId: selectedService.id }))
                responseMessage = `Serviço selecionado: ${selectedService.name}. Agora, informe a data (ex: 2026-02-01).`;
            } else {
                responseMessage = 'Serviço inválido. Tente novamente.';
            }
        } else if (message.match(/^\d{4}-\d{2}-\d{2}$/)) {  // Etapa: Data
            // Recupere sessão (ex: const session = await Redis.get(remoteJid))
            // Cheque opening hours para o dia
            const dayOfWeek = new Date(message).getDay();
            const hours = await hourService.getByDayOfWeek(dayOfWeek);
            if (hours.dayClosed) {
                responseMessage = 'Desculpe, fechado nesse dia.';
            } else {
                // Cheque disponibilidade (use sua função checkAvailability, com professionalId default ou escolhido)
                const isAvailable = await appointmentService.checkAvailability('professional-id-default', message, 60);  // Ajuste duration
                responseMessage = isAvailable ? 'Horário disponível! Informe a hora (ex: 14:00).' : 'Indisponível. Tente outra data.';
            }
        } else if (message.match(/^\d{2}:\d{2}$/)) {  // Etapa: Hora
            // Recupere sessão, combine data + hora
            const fullDate = new Date(`${session.date}T${message}:00`);  // Ajuste com sessão anterior
            const appointment = await appointmentService.create({
                clientId: user.id,
                professionalId: 'professional-id-default',  // Ou pergunte antes
                serviceIds: [session.serviceId],
                date: fullDate,
                duration: 60  // Do serviço
            });
            responseMessage = `Agendamento criado! ID: ${appointment.id}. Confirmação enviada.`;
        } else {
            responseMessage = 'Comando inválido. Digite "agendar" para começar.';
        }
    } catch (error) {
        responseMessage = 'Erro ao processar. Tente novamente.';
    }

    // Sempre retorne isso para o Evolution Bot
    return res.json({ message: responseMessage });
});

export default botRouter;