const BASE_URL = "http://localhost:8000";

let SESSION_ID = null;

function normalizeAYRCode(code) {
  if (typeof code !== "string") return "";

  return code
    .replace(/\r\n/g, "\n")      // windows -> unix newline
    .replace(/\t/g, "    ");     // tabs -> 4 spaces
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok && !path.startsWith("/run") && !path.startsWith("/input")) {
    throw data;
  }

  return data;
}

const api = {
  run: async (code) => {
    const safeCode = normalizeAYRCode(code);

    return request("/run", {
      method: "POST",
      body: JSON.stringify({ code: safeCode }),
    });
  },

  debug: async (code) => {
    const safeCode = normalizeAYRCode(code);

    const res = await request("/debug", {
      method: "POST",
      body: JSON.stringify({ code: safeCode }),
    });

    SESSION_ID = res.session_id;
    return res;
  },

  input: async (sessionId, value) => {
    return request("/input", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        value,
      }),
    });
  },

  step: async (sessionId) => {
    return request(`/step?session_id=${sessionId}`, {
      method: "POST",
    });
  },

  back: async (sessionId) => {
    return request(`/back?session_id=${sessionId}`, {
      method: "POST",
    });
  },

  next: async (sessionId) => {
    return request(`/next?session_id=${sessionId}`, {
      method: "POST",
    });
  },

  env: async (sessionId) => {
    return request(`/env?session_id=${sessionId}`);
  },

  detail: async (sessionId) => {
    return request(`/detail?session_id=${sessionId}`);
  },
};

export default api;
