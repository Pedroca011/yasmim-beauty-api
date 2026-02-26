import express from "express";
import cors from "cors";  // ← adicione isso
import Logging from "./library/Logging";
import HttpError from "./utils/httpError";
import { router as v1 } from "./routers/v1";
// import { config } from "./config/config";  // se precisar

const app = express();

const StartServer = async () => {
  // CORS global ANTES de qualquer coisa (resolve preflight OPTIONS automaticamente)
  app.use(cors({
    origin: "*",  // mude para origens específicas em prod: ["https://seu-frontend.com"]
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    credentials: true,  // se usar cookies/auth com credentials
    optionsSuccessStatus: 200  // compatibilidade
  }));

  // Logging (depois do CORS para capturar tudo)
  app.use((req, res, next) => {
    Logging.info(
      `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );
    res.on("finish", () => {
      Logging.info(
        `Incoming -> Method: [${req.method}] - Url: [${req.url}] IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });
    next();
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Remova completamente o handler manual de CORS/OPTIONS que você tinha
  // (não precisa mais dele com cors())

  // Rotas
  app.use("/api", v1);

  // Adicione uma rota de teste simples (para confirmar que o server responde)
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "API is alive" });
  });

  // Rota raiz
  app.get("/", (_, res) => {
    res.status(200).json({
      success: true,
      message: "Api test runner...",
    });
  });

  // Catch-all 404 (último middleware)
  app.use((req, res, next) => {
    const error = new Error("not found");
    Logging.error(error);
    return res.status(404).json({ success: false, message: error.message });
  });

  // Error handler (último)
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
  app.listen(port, () =>
    Logging.info(`Server is running on port ${port}.`)
  );
};

StartServer();