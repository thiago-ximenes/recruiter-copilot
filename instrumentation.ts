import { registerOTel } from "@vercel/otel";

// OTel pro Next.js. Exporta via OTLP quando OTEL_EXPORTER_OTLP_ENDPOINT está setado
// (ex.: Grafana Cloud); sem endpoint, é efetivamente no-op.
export function register() {
  registerOTel({ serviceName: process.env.OTEL_SERVICE_NAME ?? "recruiter-copilot" });
}
