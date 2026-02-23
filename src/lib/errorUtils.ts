export function formatSoneError(err: unknown): string {
  const parsed =
    typeof err === "string"
      ? (() => {
          try {
            return JSON.parse(err);
          } catch {
            return null;
          }
        })()
      : err;

  const msg = (parsed as any)?.message;

  if (typeof msg === "string") return msg;
  if (msg && typeof msg === "object") {
    const body = (msg as any).body;
    return typeof body === "string" ? body : JSON.stringify(body);
  }
  return typeof err === "string" ? err : "An unexpected error occurred";
}
