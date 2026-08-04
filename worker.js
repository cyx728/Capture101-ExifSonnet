const UPSTREAM_URL = "https://cdn.juaiapi.com/v1/chat/completions";
const MAX_REQUEST_BYTES = 2 * 1024 * 1024;

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const configured = allowedOrigins(env);
  const allowOrigin = configured.includes("*") ? "*" : (configured.includes(origin) ? origin : "");
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  });
  if (allowOrigin) headers.set("Access-Control-Allow-Origin", allowOrigin);
  return headers;
}

function responseWithCors(body, init, request, env) {
  const headers = new Headers(init?.headers);
  for (const [name, value] of corsHeaders(request, env)) headers.set(name, value);
  return new Response(body, { ...init, headers });
}

function originAllowed(request, env) {
  const configured = allowedOrigins(env);
  if (!configured.length || configured.includes("*")) return true;
  return configured.includes(request.headers.get("Origin") || "");
}

export default {
  async fetch(request, env) {
    if (!originAllowed(request, env)) {
      return responseWithCors("Origin not allowed", { status: 403 }, request, env);
    }

    if (request.method === "OPTIONS") {
      return responseWithCors(null, { status: 204 }, request, env);
    }
    if (request.method !== "POST") {
      return responseWithCors("Method Not Allowed", { status: 405 }, request, env);
    }
    if (!env.JUAI_API_KEY) {
      return responseWithCors("Worker secret JUAI_API_KEY is not configured", { status: 500 }, request, env);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return responseWithCors("Request body too large", { status: 413 }, request, env);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return responseWithCors("Invalid JSON body", { status: 400 }, request, env);
    }
    if (!Array.isArray(payload?.messages) || !payload.messages.length) {
      return responseWithCors("messages is required", { status: 400 }, request, env);
    }
    payload.model = "gpt-5.4";
    payload.stream = true;

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${env.JUAI_API_KEY}`);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "text/event-stream");
    headers.delete("Origin");
    headers.delete("Host");
    headers.delete("Content-Length");

    try {
      const upstream = await fetch(UPSTREAM_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const outputHeaders = new Headers();
      for (const name of ["content-type", "cache-control", "x-request-id", "retry-after"]) {
        const value = upstream.headers.get(name);
        if (value) outputHeaders.set(name, value);
      }
      outputHeaders.set("Cache-Control", "no-cache, no-transform");
      return responseWithCors(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: outputHeaders
      }, request, env);
    } catch (error) {
      return responseWithCors(error instanceof Error ? error.message : "Upstream request failed", { status: 502 }, request, env);
    }
  }
};
