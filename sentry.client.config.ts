// Configuración de Sentry para el cliente (browser).
// Next 14: este archivo lo carga el SDK automáticamente (NO instrumentation-client.ts, que es Next 15.3+).
import * as Sentry from "@sentry/nextjs";

import { scrubPii } from "@/lib/observability/scrubPii";

Sentry.init({
  // DSN ausente => Sentry.init queda en no-op y no se envía ningún evento.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend: scrubPii,
});
