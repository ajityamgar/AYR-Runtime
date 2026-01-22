const BASE_URL = import.meta.env.VITE_API_URL;

let SESSION_ID = null;

function normalizeAYRCode(code) {
  if (typeof code !== "string") return "";

  return code
    .replace(/\r\n/g, "\n") // windows -> unix newline
    .replace(/\t/g, "    "); // tabs -> 4 spaces
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  // ✅ safe json parsing
  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = {
      success: false,
      error: "Invalid JSON response from server",
    };
  }

  // ✅ run/input/debug pe throw mat karo (we handle UI response)
  if (
    !res.ok &&
    !path.startsWith("/run") &&
    !path.startsWith("/input") &&
    !path.startsWith("/debug")
  ) {
    throw data;
  }

  return data;
}

function normalizeRunResponse(data) {
  // ✅ make sure frontend always gets these fields
  if (!data || typeof data !== "object") {
    return {
      success: false,
      output: [],
      problems: [],
      errors: [],
      warnings: [],
      bugs: [],
      summary: {
        total_errors: 0,
        total_warnings: 0,
        total_bugs: 0,
        total_problems: 0,
      },
      env: {},
      trace: [],
      detail: {},
      memory_kb: 0,
      memoryKB: 0,
      need_input: false,
      needs_input: false,
    };
  }

  const problems = Array.isArray(data.problems) ? data.problems : [];
  const errors = Array.isArray(data.errors) ? data.errors : [];
  const warnings = Array.isArray(data.warnings) ? data.warnings : [];
  const bugs = Array.isArray(data.bugs) ? data.bugs : [];

  const summary =
    data.summary && typeof data.summary === "object"
      ? data.summary
      : {
          total_errors: errors.length,
          total_warnings: warnings.length,
          total_bugs: bugs.length,
          total_problems: problems.length,
        };

  // ✅ support both keys:
  const needsInput = Boolean(data.needs_input || data.need_input);

  const memoryKB = typeof data.memory_kb === "number" ? data.memory_kb : 0;

  return {
    ...data,

    // core
    output: Array.isArray(data.output) ? data.output : [],
    problems,
    errors,
    warnings,
    bugs,
    summary,
    env: data.env && typeof data.env === "object" ? data.env : {},
    trace: Array.isArray(data.trace) ? data.trace : [],
    detail: data.detail && typeof data.detail === "object" ? data.detail : {},

    // memory mapping for UI
    memory_kb: memoryKB,
    memoryKB: memoryKB,

    // input flags support
    needs_input: needsInput,
    need_input: needsInput,
  };
}

function normalizeDebugResponse(data) {
  if (!data || typeof data !== "object") {
    return {
      success: false,
      session_id: null,
      debug_key: null,
      done: false,
      needs_input: false,
      error: "Invalid debug response",
      line: null,
      expression: null,
      env: {},
      output: [],
      trace: [],
      detail: {},
      memory_kb: 0,
      memoryKB: 0,
      pc: 0,
    };
  }

  const memoryKB = typeof data.memory_kb === "number" ? data.memory_kb : 0;

  return {
    ...data,
    env: data.env && typeof data.env === "object" ? data.env : {},
    output: Array.isArray(data.output) ? data.output : [],
    trace: Array.isArray(data.trace) ? data.trace : [],
    detail: data.detail && typeof data.detail === "object" ? data.detail : {},
    memory_kb: memoryKB,
    memoryKB: memoryKB,
    pc: typeof data.pc === "number" ? data.pc : 0,
    done: Boolean(data.done),
    needs_input: Boolean(data.needs_input || data.need_input),
  };
}

const api = {
  // ✅ NORMAL RUN (Problems + Summary)
  run: async (code) => {
    const safeCode = normalizeAYRCode(code);

    const res = await request("/run", {
      method: "POST",
      body: JSON.stringify({ code: safeCode }),
    });

    return normalizeRunResponse(res);
  },

  // ✅ DEBUG START (Option A: debug_key based)
  debug: async (code, debugKey) => {
    const safeCode = normalizeAYRCode(code);

    const res = await request("/debug", {
      method: "POST",
      body: JSON.stringify({
        code: safeCode,
        debug_key: debugKey, // ✅ important
      }),
    });

    SESSION_ID = res.session_id;
    return normalizeDebugResponse(res);
  },

  // ✅ DEBUG: Run step-by-step internally until NEXT NEW error
  nextError: async (sessionId, debugKey) => {
    const res = await request(
      `/debug/rerunDebug?session_id=${sessionId}&debug_key=${debugKey}`,
      {
        method: "POST",
      }
    );

    return normalizeDebugResponse(res);
  },

  // ✅ INPUT (Normal Run or Debug)
  input: async (sessionId, value) => {
    const res = await request("/input", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        value,
      }),
    });

    // ✅ IMPORTANT: input response should also be normalized
    return normalizeRunResponse(res);
  },

  // ✅ Old debug helpers (optional)
  step: async (sessionId) => {
    const res = await request(`/step?session_id=${sessionId}`, {
      method: "POST",
    });

    // ✅ normalize as debug-style response
    return normalizeDebugResponse(res);
  },

  back: async (sessionId) => {
    const res = await request(`/back?session_id=${sessionId}`, {
      method: "POST",
    });

    // ✅ normalize to avoid env/trace/detail missing in UI
    return normalizeDebugResponse(res);
  },

  next: async (sessionId) => {
    const res = await request(`/next?session_id=${sessionId}`, {
      method: "POST",
    });

    return normalizeDebugResponse(res);
  },

  env: async (sessionId) => {
    return request(`/env?session_id=${sessionId}`);
  },

  detail: async (sessionId) => {
    const res = await request(`/detail?session_id=${sessionId}`);
    // ✅ keep same structure so UI can read easily
    return normalizeRunResponse(res);
  },

  // ✅ helper
  getSessionId: () => SESSION_ID,
};

export default api;
