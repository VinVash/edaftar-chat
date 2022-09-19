import express from "express";
import logger from "morgan";
import cors from "cors";
import helmet from "helmet";
import lusca from "lusca";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { SENTYRY_DSN } from "./utils/secrets";
import { connect } from "./config/db";
import { router } from "./routes/chat";
// import { connectRedis } from "./config/cache";
const app = express();

Sentry.init({
    dsn: SENTYRY_DSN,
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

// MongoDB connection
connect();

// Redis Config
// connectRedis();

// Express configuration
app.set("port", process.env.PORT || 3001);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(cors(
    {
        origin: ["http://localhost:3000", "https://sih-2022.vercel.app", "https://sih-2022-server.azurewebsites.net", "https://bf9f-2401-4900-4dd3-691d-a846-6bdf-5dd6-3810.in.ngrok.io"],
    }
));
app.use(logger("dev"));
app.use("/api/chat", router);

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

export default app;