import { Router } from "express";
import { validate } from "../../middlewares";
import { authSchema, userSchema } from "../../validations";
import { AuthController, UserController } from "../../controllers";

const _router: Router = Router({
  mergeParams: true,
});

_router.post("/sing-up", validate(userSchema), UserController.singUp);

_router.post("/sing-in", validate(authSchema), AuthController.signIn);

export const router = _router;
