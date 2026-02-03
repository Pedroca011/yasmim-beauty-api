import { NextFunction, Request, Response, Router } from "express";
import { router as authRouter } from "./auth.route";
import { router as productRouter } from "./product.route";
import { router as DayRouter } from "./day.route";
import { router as AppointmentRouter } from "./appointment.route";
import { router as BotRouter } from "./bot.route";

const _router: Router = Router({
  mergeParams: true,
});

//DEFINE API VERSION
_router.use(function (req: Request, res: Response, next: NextFunction) {
  res.setHeader("Api-Version", "v1");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// HEALTHCHECK
_router.route("/v1/health-check").get(function (req: Request, res: Response) {
  return res.status(200).json({ healthy: true, version: "v1" });
});

// ROUTERS
_router.use("/v1/auth", authRouter);
_router.use("/v1/product", productRouter);
_router.use("/v1/day", DayRouter);
_router.use("/v1/appointment", AppointmentRouter);
_router.use("/v1", BotRouter);


export const router = _router;
