import express from "express";
import cors from "cors"; // ← novo import
import Logging from "./library/Logging";
import HttpError from "./utils/httpError";
import { router as v1 } from "./routers/v1";
import { config } from "./config/config";

const app = express();

const StartServer = async () => {
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
      ],
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  );

  app.use((req, res, next) => {
    Logging.info(
      `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
    );
    res.on("finish", () => {
      Logging.info(
        `Incoming -> Method: [${req.method}] - Url: [${req.url}] IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`,
      );
    });
    next();
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use("/api", v1);

  app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok", message: "API running" });
  });

  app.get("/", (_, res) => {
    res.status(200).json({
      success: true,
      message: "Api Yasmim runner...",
    });
  });

  app.use((req, res, next) => {
    const error = new Error("not found");
    Logging.error(error);
    return res.status(404).json({ success: false, message: error.message });
  });

  app.use(function (err: any, req: any, res: any, next: any) {
    Logging.error(err.stack);

    if (err instanceof HttpError) {
      return err.sendError(res);
    } else {
      return res.status(500).json({
        error: {
          title: "general_error",
          detail: "An error occurred, Please retry again later",
          code: 500,
        },
      });
    }
  });

  const port = process.env.PORT || 3333;
  app.listen(port, () => Logging.info(`Server is running on port ${port}.`));
};

StartServer();
