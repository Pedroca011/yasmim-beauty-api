import { Router, Request, Response } from "express";

const _router: Router = Router({
  mergeParams: true,
});

_router.post("/sing-up", (req: Request, res: Response) => {
  // TODO: Implement sign-up logic
  res.status(200).json({ message: "Sign-up endpoint - not implemented yet" });
});

_router.post("/sing-in", (req: Request, res: Response) => {
  // TODO: Implement sign-in logic
  res.status(200).json({ message: "Sign-in endpoint - not implemented yet" });
});

export const router = _router;
