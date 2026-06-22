import { type Attributes, type Span, SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("recruiter-copilot");

// Envolve uma etapa do pipeline num span. Sem exporter configurado, o overhead é
// desprezível (tracer no-op).
export async function span<T>(
  name: string,
  fn: (s: Span) => Promise<T>,
  attrs?: Attributes,
): Promise<T> {
  return tracer.startActiveSpan(name, async (s) => {
    if (attrs) s.setAttributes(attrs);
    try {
      return await fn(s);
    } catch (e) {
      s.recordException(e as Error);
      s.setStatus({ code: SpanStatusCode.ERROR, message: (e as Error).message });
      throw e;
    } finally {
      s.end();
    }
  });
}
