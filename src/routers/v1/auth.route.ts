import { Router, Request, Response } from "express";
import { validate } from "../../middlewares";
import { userSchema } from "../../validations";
import { UserController } from "../../controllers";

const _router: Router = Router({
  mergeParams: true,
});

_router.post("/sing-up", validate(userSchema), UserController.singUp);

_router.post("/sing-in", (req: Request, res: Response) => {
  res.status(200).json({ message: "Sign-in endpoint - not implemented yet" });
});

export const router = _router;
