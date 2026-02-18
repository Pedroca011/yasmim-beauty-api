import { Router } from 'express';
import { BotController } from '../../controllers';

const _router = Router();

_router.post('/bot-webhook', BotController.handleWebhook);

export const router = _router;