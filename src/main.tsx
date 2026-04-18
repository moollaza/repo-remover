import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import "./globals.css";
import { startCLSLoggerIfRequested } from "./utils/cls-logger";
import { sentryBeforeSend } from "./utils/sentry-before-send";

startCLSLoggerIfRequested();

// Sentry initialization — privacy-first, scrubs tokens and PII
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN && import.meta.env.PROD) {
  Sentry.init({
    beforeSend: sentryBeforeSend,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    dsn: SENTRY_DSN,
    enabled: import.meta.env.PROD,
    environment: import.meta.env.MODE,
    maxBreadcrumbs: 10,
    tracesSampleRate: 0.1,
  });
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
