import { Router } from "express";
import { AppointmentController } from "../../controllers";
import { authorize } from "../../middlewares/authorized";
import { IRoleName } from "../../utils/enums";

const _router: Router = Router({
  mergeParams: true,
});

_router.post(
  "/:clientId",
  authorize([IRoleName.ADMIN, IRoleName.USER, IRoleName.PROFESSIONAL]),
  AppointmentController.create,
);

_router.get("/", authorize([IRoleName.ADMIN]), AppointmentController.list);

_router.get(
  "/:id",
  authorize([IRoleName.ADMIN, IRoleName.USER, IRoleName.PROFESSIONAL]),
  AppointmentController.show,
);

_router.patch(
  "/:id/cancel",
  authorize([IRoleName.ADMIN, IRoleName.USER, IRoleName.PROFESSIONAL]),
  AppointmentController.cancel,
);

_router.patch(
  "/:id",
  authorize([IRoleName.ADMIN]),
  AppointmentController.update,
);

_router.delete(
  "/:id",
  authorize([IRoleName.ADMIN]),
  AppointmentController.delete,
);

export const router = _router;
