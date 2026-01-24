import { Router } from "express";
import hourController from "../../controllers/day.controller";
import { authorize } from "../../middlewares/authorized";
import { IRoleName } from "../../utils/enums";

const _router: Router = Router({
    mergeParams: true,
});

_router.get("/", 
    authorize([IRoleName.ADMIN, IRoleName.PROFESSIONAL, IRoleName.USER]), 
    hourController.getAllDay
);

_router.get("/:dayId",
    authorize([IRoleName.ADMIN, IRoleName.PROFESSIONAL, IRoleName.USER]),
    hourController.getByIdDay
);

_router.patch("/:dayId",
    authorize([IRoleName.ADMIN]),
    hourController.updateDay
);

export const router = _router;