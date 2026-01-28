import { Router } from "express";
import { AppointmentController } from "../../controllers";

const _router: Router = Router({
    mergeParams: true,
  });

_router.post('/:clientId', AppointmentController.create);


export const router = _router;