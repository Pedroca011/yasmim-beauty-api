import { Router } from "express";
import hourController from "../../controllers/hour.controller";

const _router: Router = Router({
    mergeParams: true,
});

_router.get("/", hourController.getAllDay);
_router.get("/", hourController.getByIdDay);
_router.patch("/", hourController.updateHour);

export const router = _router;