// Configuración de Sentry para el servidor (runtime nodejs en Vercel).
// Cargado por instrumentation.ts register() cuando NEXT_RUNTIME === "nodejs".
import * as Sentry from "@sentry/nextjs";

import { scrubPii } from "@/lib/observability/scrubPii";

Sentry.init({
  // DSN ausente => Sentry.init queda en no-op y no se envía ningún evento.
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend: scrubPii,
});
