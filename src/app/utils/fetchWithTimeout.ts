const DEFAULT_TIMEOUT_MS = 10_000;

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Add CSRF protection header on all state-changing requests
  const method = (options.method ?? "GET").toUpperCase();
  if (MUTATION_METHODS.has(method)) {
    const headers = new Headers(options.headers);
    headers.set("x-requested-with", "XMLHttpRequest");
    options = { ...options, headers };
  }

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}
