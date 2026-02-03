import { Request, Response } from "express";
import PrismaAdapter from "../config/prisma";
import { appointmentService, hourService, productService, userService } from "../services";
import { DayOfWeek } from "../utils/enums";
import { BotSessionData } from "../interfaces";
import axios from 'axios';

class BotController {
    // Versão antiga mantida: Para Evolution Bot antigo (retorna { message: "texto" })
    handleBot = async (req: Request, res: Response) => {
        console.log('[HANDLE BOT] Iniciando processamento...');
        console.log('[HANDLE BOT] Inputs recebidos:', req.body.inputs);
        const { apiKey, inputs } = req.body;

        if (apiKey !== process.env.BOT_API_KEY) {
            console.log('[HANDLE BOT] API Key inválida');
            return res.status(401).json({ message: 'Acesso negado' });
        }

        const { remoteJid, pushName, message } = inputs;
        console.log('[HANDLE BOT] Mensagem recebida:', message?.toLowerCase()?.trim());
        let responseMessage = '';

        // Ignora mensagens vazias ou não-text
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.log('[HANDLE BOT] Ignorando mensagem vazia ou não-text');
            return res.status(200).send();
        }

        // Ignora mensagens em grupos a menos que seja um comando ou sessão ativa
        if (remoteJid.endsWith('@g.us')) {
            const groupSession = await PrismaAdapter.botSession.findUnique({ where: { remoteJid } });
            const now = new Date();
            const hasActiveSession = groupSession && now <= new Date(groupSession.expiresAt) && groupSession.step !== 'initial';
            const normalizedMessage = message.toLowerCase().trim();
            if (!normalizedMessage.startsWith('agendar') && !normalizedMessage.startsWith('#sair') && !hasActiveSession) {
                console.log('[HANDLE BOT] Ignorando mensagem em grupo sem comando ou sessão');
                return res.status(200).send();
            }
        }

        // Ignora mensagens enviadas pelo bot (fromMe: true)
        if (inputs.fromMe === true) {
            console.log('[HANDLE BOT] Ignorando mensagem enviada pelo bot');
            return res.status(200).send();
        }

        try {
            // Extraia phone de remoteJid
            const phone = remoteJid.split('@')[0];

            // Encontre ou crie user (sem email/password para bot)
            let user = await userService.findByPhone(phone);
            if (!user) {
                user = await userService.signUp({ name: pushName || 'Usuário WhatsApp', phone, source: 'WHATSAPP' });
            }

            // Gerencie sessão com Prisma (BotSession)
            let session = await PrismaAdapter.botSession.findUnique({ where: { remoteJid } });
            const now = new Date();
            const expireTime = new Date(now.getTime() + 30 * 60 * 1000);  // 30 min

            if (!session || now > new Date(session.expiresAt)) {
                // Crie ou atualize sessão
                session = await PrismaAdapter.botSession.upsert({
                    where: { remoteJid },
                    create: {
                        remoteJid,
                        step: 'initial',
                        data: {},
                        expiresAt: expireTime,
                    },
                    update: {
                        step: 'initial',
                        data: {},
                        expiresAt: expireTime,
                    },
                });
            }

            // Fluxo de conversa baseado no step atual e mensagem
            const sessionData: BotSessionData = (session.data as unknown as BotSessionData) || { step: 'initial' };

            const normalizedMessage = message.toLowerCase().trim();
            console.log('[HANDLE BOT] Mensagem normalizada:', normalizedMessage);

            switch (normalizedMessage) {
                case 'agendar':
                case 'start':  // Palavra alternativa para reiniciar
                    console.log('[HANDLE BOT] Entrou no case agendar/start');
                    const products = await productService.getAllProduct();
                    console.log('[HANDLE BOT] Produtos carregados:', products.length);
                    const buttons = products.slice(0, 3).map((p, i) => ({
                        title: `${i + 1}. ${p.name}`,
                        displayText: `${i + 1}. ${p.name}`,
                        id: `btn_${i + 1}`,
                    }));

                    console.log('[HANDLE BOT] Buttons gerados:', buttons);
                    await this.sendButtonsToEvolution(remoteJid, 'Escolha um Serviço', 'Selecione clicando no botão:', 'Studio Bot', buttons);

                    sessionData.step = 'service';
                    responseMessage = '';  // Não retorna texto; envio feito via axios
                    break;

                default:
                    if (normalizedMessage === '#sair') {
                        await PrismaAdapter.botSession.delete({ where: { remoteJid } });
                        session = null;
                        responseMessage = 'Sessão cancelada. Até logo!';
                        break;
                    }

                    // Lógica por step atual, mas só responde se for um passo válido ou comando
                    if (sessionData.step === 'service' && normalizedMessage.match(/^\d+$/)) {
                        console.log('[HANDLE BOT] Entrou no step service');
                        const serviceIndex = parseInt(normalizedMessage) - 1;
                        const services = await productService.getAllProduct();
                        const selectedService = services[serviceIndex];
                        if (selectedService) {
                            sessionData.serviceId = selectedService.id;
                            sessionData.step = 'date';
                            responseMessage = `Serviço selecionado: ${selectedService.name} (${selectedService.duration} min). Agora, informe a data (ex: 2026-02-01).`;
                        } else {
                            responseMessage = 'Número de serviço inválido. Tente novamente.';
                        }
                    } else if (sessionData.step === 'date' && normalizedMessage.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        console.log('[HANDLE BOT] Entrou no step date');
                        if (!sessionData.serviceId) {
                            responseMessage = 'Erro na sessão. Reinicie com "agendar".';
                            break;
                        }
                        const service = await productService.getById(sessionData.serviceId);
                        const targetDate = new Date(normalizedMessage);
                        const dayNumber = targetDate.getDay();  // 0=Sunday, 1=Monday...
                        const dayOfWeekEnum = this.mapDayNumberToEnum(dayNumber);

                        const hours = await hourService.getByDayOfWeekEnum(dayOfWeekEnum, normalizedMessage, service.duration);

                        if (hours.dayClosed) {
                            responseMessage = 'Desculpe, estamos fechados nesse dia. Escolha outra data.';
                        } else if (hours.availableTimes.length === 0) {
                            responseMessage = 'Nenhum horário disponível nessa data. Tente outra.';
                        } else {
                            sessionData.date = normalizedMessage;
                            sessionData.step = 'time';
                            responseMessage = `Data selecionada: ${normalizedMessage}. Horários disponíveis:\n${hours.availableTimes.join('\n')}\nInforme a hora (ex: 14:00).`;
                        }
                    } else if (sessionData.step === 'time' && normalizedMessage.match(/^\d{2}:\d{2}$/)) {
                        console.log('[HANDLE BOT] Entrou no step time');
                        if (!sessionData.serviceId || !sessionData.date) {
                            responseMessage = 'Erro na sessão. Reinicie com "agendar".';
                            break;
                        }

                        const fullDateStr = `${sessionData.date}T${normalizedMessage}:00`;
                        const fullDate = new Date(fullDateStr);

                        const professionalId = '653cf5e1-62f6-4651-8a3f-7a09d7b03749';  // Fixo; expanda para escolha
                        const duration = (await productService.getById(sessionData.serviceId)).duration;
                        const isAvailable = await appointmentService.checkAvailability(professionalId, fullDate, duration);

                        if (!isAvailable) {
                            responseMessage = 'Horário não disponível. Escolha outro.';
                            break;
                        }

                        const appointment = await appointmentService.create({
                            clientId: user.id,
                            professionalId,
                            serviceIds: [sessionData.serviceId],
                            date: fullDate,
                            duration,
                        });

                        responseMessage = `Agendamento criado com sucesso! Data: ${fullDate.toLocaleString()}. Obrigado!`;

                        // Limpa sessão após sucesso
                        await PrismaAdapter.botSession.delete({ where: { remoteJid } });
                        session = null;
                        break;
                    } else {
                        // Só responde se for uma sessão ativa; caso contrário, ignora
                        if (sessionData.step !== 'initial') {
                            // responseMessage = 'Comando inválido para esta etapa. Digite "agendar" para reiniciar ou "#sair" para cancelar.';
                        } else {
                            console.log('[HANDLE BOT] Mensagem ignorada: não é comando de início nem sessão ativa');
                            return res.status(200).send();
                        }
                    }
                    break;
            }

            // Atualiza sessão se não deletada
            if (session) {
                await PrismaAdapter.botSession.update({
                    where: { remoteJid },
                    data: { step: sessionData.step, data: sessionData as unknown as object, expiresAt: expireTime },
                });
            }

            // Para respostas simples (não buttons), envia via sendText
            if (responseMessage) {
                await this.sendTextToEvolution(remoteJid, responseMessage);
            }
        } catch (error: any) {
            console.error('[HANDLE BOT] Erro geral:', error);
            try {
                await this.sendTextToEvolution(remoteJid, 'Erro ao processar. Tente novamente.');
            } catch (sendError) {
                console.error('Falha ao enviar mensagem de erro ao usuário (Evolution API):', sendError);
            }
        }

        if (responseMessage) {
            return res.json({ message: responseMessage });
        } else {
            return res.status(200).send();
        }
    }

    handleWebhook = async (req: Request, res: Response) => {
        console.log('WEBHOOK CHAMADO! Payload recebido:', JSON.stringify(req.body, null, 2));

        const event = req.body;

        try {
            // Aceita o evento real da Evolution (messages.upsert)
            if (event.event === 'messages.upsert' && event.data?.message) {
                const remoteJid = event.data.key.remoteJid;
                const pushName = event.data.pushName || 'Usuário';
                const messageText = event.data.message.conversation || event.data.message.extendedTextMessage?.text || '';

                console.log('Mensagem recebida de:', event.data.key.fromMe ? 'VOCÊ MESMO' : 'OUTRO CONTATO');
                console.log('Texto da mensagem:', messageText);

                const mockReq = {
                    body: {
                        apiKey: process.env.BOT_API_KEY,
                        inputs: { remoteJid, pushName, message: messageText, fromMe: event.data.key.fromMe }
                    }
                } as Request;

                await this.handleBot(mockReq, res);
            } else {
                console.log('Evento ignorado (não é messages.upsert ou sem message):', event.event);
            }
        } catch (error) {
            console.error('Erro no webhook:', error);
        }

        return res.status(200).send();
    }

    private mapDayNumberToEnum(dayNumber: number): DayOfWeek {
        const days: DayOfWeek[] = [
            DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY,
        ];
        return days[dayNumber];
    }

    private getEvolutionInstance(): string {
        return process.env.EVOLUTION_INSTANCE_NAME || 'studio_bot';
    }

    /**
     * Formato compatível com Evolution API v1.7+ e cloud API (mais comum em 2025/2026)
     * number: apenas o número sem @s.whatsapp.net
     * buttons: array simples com buttonId, displayText, type
     */
    private async sendButtonsToEvolution(
        remoteJid: string,
        title: string,
        description: string,
        footer: string,
        buttons: { title: string; displayText: string; id: string }[]
    ) {
        const instance = this.getEvolutionInstance();
        const baseUrl = (process.env.EVOLUTION_API_URL || 'http://localhost:8080').replace(/\/$/, '');

        const number = remoteJid.split('@')[0]; // ex: 5511954121619

        // Payload corrigido - formato flat, sem "options"
        const payload = {
            number: number,
            title: title || "Escolha uma opção",
            description: description,
            footer: footer || "Studio Bot",
            buttons: buttons.map((btn, index) => ({
                buttonId: btn.id || `btn_${index + 1}`,
                displayText: btn.displayText || btn.title,
                type: 1  // 1 = reply button (obrigatório na maioria das versões)
            }))
        };

        try {
            console.log('[SEND BUTTONS] Payload enviado:', JSON.stringify(payload, null, 2));

            const response = await axios.post(
                `${baseUrl}/message/sendButtons/${instance}`,
                payload,
                {
                    headers: {
                        apikey: process.env.EVOLUTION_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000  // 10 segundos de timeout para evitar travamentos
                }
            );

            console.log('[SEND BUTTONS] Sucesso:', response.data);
            return response.data;
        } catch (error: any) {
            const errorDetail = error.response?.data || error.message;
            console.error('[SEND BUTTONS] Erro detalhado:', errorDetail);

            // Fallback para texto simples
            const fallbackText = `${description}\n\n${buttons.map(b => b.displayText || b.title).join('\n')}`;
            await this.sendTextToEvolution(remoteJid, fallbackText);
        }
    }

    /**
     * Formato corrigido para sendText (mais simples e compatível)
     */
    private async sendTextToEvolution(remoteJid: string, text: string) {
        const instance = this.getEvolutionInstance();
        const baseUrl = (process.env.EVOLUTION_API_URL || 'http://localhost:8080').replace(/\/$/, '');

        const number = remoteJid.split('@')[0];

        const payload = {
            number: number,
            text: text.trim()  // Remove espaços extras que podem causar 500
        };

        try {
            console.log('[SEND TEXT] Payload enviado:', JSON.stringify(payload, null, 2));

            const response = await axios.post(
                `${baseUrl}/message/sendText/${instance}`,
                payload,
                {
                    headers: {
                        apikey: process.env.EVOLUTION_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            console.log('[SEND TEXT] Sucesso:', response.data);
        } catch (error: any) {
            console.error('[SEND TEXT] Erro detalhado:', error.response?.data || error.message);
        }
    }
}

export default new BotController();