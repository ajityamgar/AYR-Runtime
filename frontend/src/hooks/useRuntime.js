// src/hooks/useRuntime.js
import { useState } from "react";
import api from "../services/api";

export default function useRuntime() {
  // ===============================
  // CORE STATES
  // ===============================
  const [code, setCode] = useState("");
  const [activeInspector, setActiveInspector] = useState("output");

  const [mode, setMode] = useState("idle"); // idle | run | debug
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState(null);

  // ✅ debug_key (file id) - used for "next error only"
  const [debugKey, setDebugKey] = useState(null);

  const [env, setEnv] = useState({});
  const [trace, setTrace] = useState([]);
  const [output, setOutput] = useState([]);

  // ✅ detail + memory
  const [detail, setDetail] = useState({});
  const [memoryKB, setMemoryKB] = useState(0);

  // ✅ old error/warning system
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null); // input/info
  const [warnings, setWarnings] = useState([]);

  // ✅ unified problems system
  const [problems, setProblems] = useState([]);
  const [summary, setSummary] = useState({
    total_errors: 0,
    total_warnings: 0,
    total_bugs: 0,
    total_problems: 0,
  });

  const [pc, setPc] = useState(0);
  const [finished, setFinished] = useState(false);

  // ===============================
  // HELPERS
  // ===============================
  const resetDebuggerUI = () => {
    setSessionId(null);
    setEnv({});
    setTrace([]);
    setPc(0);
    setFinished(false);
  };

  const clearRunUI = () => {
    setOutput([]);
    setWarnings([]);
    setError(null);
    setWarning(null);

    setDetail({});
    setMemoryKB(0);

    setProblems([]);
    setSummary({
      total_errors: 0,
      total_warnings: 0,
      total_bugs: 0,
      total_problems: 0,
    });
  };

  // ✅ Convert backend debug error -> unified problem object
   const buildProblemFromDebugError = (res) => {
    let msg = String(res?.error || "Unknown error");

    // ✅ extract expression from backend field OR from error string
    let expr = res?.expression;
    if (!expr) {
      const m = msg.match(/Expression:\s*(.+)/);
      if (m && m[1]) expr = m[1].trim();
    }

    // ✅ remove duplicate title prefix if backend included it
    if (typeof res?.line === "number") {
      const prefix = `Expression Error (Line ${res.line}):`;
      if (msg.startsWith(prefix)) {
        msg = msg.slice(prefix.length).trim();
      }
    }

    // ✅ also remove "Expression: xxx" from msg if we already show expression separately
    if (expr) {
      const exprText = `Expression: ${expr}`;
      if (msg.includes(exprText)) {
        msg = msg.replace(exprText, "").trim();
      }
    }

    // ✅ avoid blank message
    if (!msg) msg = "Expression evaluation failed.";

    return {
      kind: "error",
      title:
        typeof res?.line === "number"
          ? `Expression Error (Line ${res.line}):`
          : "Runtime Error:",
      message: msg,
      line: res?.line ?? null,
      expression: expr || null,
    };
  };

  // ===============================
  // INPUT SUBMIT
  // ===============================
  const submitInput = async (value) => {
    const res = await api.input(sessionId, value);

    setOutput(res.output || []);
    setEnv(res.env || {});
    setTrace(res.trace || []);
    setDetail(res.detail || {});
    setMemoryKB(res.memory_kb || 0);

    setProblems(res.problems || []);
    setSummary(
      res.summary || {
        total_errors: 0,
        total_warnings: 0,
        total_bugs: 0,
        total_problems: (res.problems || []).length,
      }
    );

    setWarning(null);

    if (res.need_input || res.needs_input) {
      setWarning({
        type: "input",
        line: res.line,
      });
    }

    if (!res.success && res.error) {
      setError({
        type: "run",
        line: res.line,
        message: res.error,
      });
      setActiveInspector("problems");
    }
  };

  // ===============================
  // ▶ NORMAL RUN (WITH EXTERNAL CODE)
  // ✅ RULES IMPLEMENTED:
  // 1) If error => ONLY problems show, output hide
  // 2) If no error => ONLY output show, problems empty
  // ===============================
  const runWithCode = async (codeToRun) => {
    resetDebuggerUI();
    clearRunUI();

    setMode("run");
    setLoading(true);

    try {
      const res = await api.run(codeToRun);

      // always update runtime internals
      setWarnings(res.warnings || []);
      setEnv(res.env || {});
      setTrace(res.trace || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      // ✅ unified problems + summary
      const problemsFromBackend = Array.isArray(res.problems) ? res.problems : [];
      const hasProblems = problemsFromBackend.length > 0;

      setSummary(
        res.summary || {
          total_errors: 0,
          total_warnings: 0,
          total_bugs: 0,
          total_problems: problemsFromBackend.length,
        }
      );

      // ✅ INPUT WAITING (special case)
      if (res.success === false && (res.need_input || res.needs_input)) {
        setSessionId(res.session_id);
        setWarning({
          type: "input",
          line: res.line,
          message: res.message || "Program is waiting for input",
        });
        setError(null);

        // in input case we show output so user sees prompts
        setOutput(res.output || []);
        setProblems(problemsFromBackend || []);
        setActiveInspector("output");
        return;
      }

      // ✅ ERROR CASE => show ONLY problems
      if (res.success === false && hasProblems) {
        setProblems(problemsFromBackend);
        setOutput([]); // ✅ IMPORTANT: hide output
        setError(null);
        setWarning(null);
        setActiveInspector("problems");
        return;
      }

      // ✅ SUCCESS CASE => show ONLY output
      if (res.success === true) {
        setOutput(res.output || []);
        setProblems([]); // ✅ IMPORTANT: problems empty
        setError(null);
        setWarning(null);
        setActiveInspector("output");
        return;
      }

      // ✅ fallback (if backend returns weird shape)
      setOutput(res.output || []);
      setProblems(problemsFromBackend || []);
      if (hasProblems) setActiveInspector("problems");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ▶ NORMAL RUN (EDITOR CODE)
  // ===============================
  const run = async () => {
    return runWithCode(code);
  };

  // ===============================
  // 🐞 DEBUG START
  // ✅ Debug click = create session + auto-run to FIRST error
  // ===============================
  const debug = async (newDebugKey, codeToDebug) => {
    clearRunUI();

    setMode("debug");
    setLoading(true);

    try {
      setDebugKey(newDebugKey);

      // ✅ 1) Create session
      const start = await api.debug(codeToDebug, newDebugKey);

      setSessionId(start.session_id);
      setEnv(start.env || {});
      setTrace(start.trace || []);
      setOutput(start.output || []);
      setDetail(start.detail || {});
      setMemoryKB(start.memory_kb || 0);

      setPc(start.pc || 0);
      setFinished(false);

      setActiveInspector("problems");

      // ✅ 2) Auto-run until first error
      const res = await api.nextError(start.session_id, newDebugKey);

      setEnv(res.env || {});
      setTrace(res.trace || []);
      setOutput(res.output || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      setPc(res.pc || 0);

      // ✅ finished clean
      if (res.done === true) {
        setFinished(true);
        setError(null);
        setProblems([]);
        setSummary({
          total_errors: 0,
          total_warnings: 0,
          total_bugs: 0,
          total_problems: 0,
        });
        setActiveInspector("output");
        return;
      }

      // ✅ stop at error (convert backend error -> problems)
      if (res.success === false && res.error) {
        const p = buildProblemFromDebugError(res);

        setError({
          type: "debug",
          message: res.error,
          line: res.line,
        });

        setProblems([p]);
        setSummary({
          total_errors: 1,
          total_warnings: 0,
          total_bugs: 0,
          total_problems: 1,
        });

        setActiveInspector("problems");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔁 RE-RUN DEBUG = Run until NEXT NEW error
  // ===============================
  const rerunDebug = async () => {
    if (!sessionId || mode !== "debug" || finished) return;
    if (!debugKey) return;

    setLoading(true);

    try {
      const res = await api.nextError(sessionId, debugKey);

      setEnv(res.env || {});
      setTrace(res.trace || []);
      setOutput(res.output || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      setPc(res.pc || 0);

      // ✅ finished clean
      if (res.done === true) {
        setFinished(true);
        setError(null);
        setProblems([]);
        setSummary({
          total_errors: 0,
          total_warnings: 0,
          total_bugs: 0,
          total_problems: 0,
        });
        setActiveInspector("output");
        return;
      }

      // ✅ stop at error (convert backend error -> problems)
      if (res.success === false && res.error) {
        const p = buildProblemFromDebugError(res);

        setError({
          type: "debug",
          message: res.error,
          line: res.line,
        });

        setProblems([p]);
        setSummary({
          total_errors: 1,
          total_warnings: 0,
          total_bugs: 0,
          total_problems: 1,
        });

        setActiveInspector("problems");
      } else {
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ⬅ BACK (DEBUG)
  // ===============================
  const back = async () => {
    if (!sessionId || mode !== "debug") return;

    const res = await api.back(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setDetail((prev) => ({
      ...(prev || {}),
      state_info: res.state_info || null, // ✅ add this
    }));
    setMemoryKB(res.memory_kb || 0);
  };

  // ===============================
  // ➡ NEXT (DEBUG) = Single step only
  // ===============================
  const next = async () => {
    if (!sessionId || mode !== "debug" || finished) return;

    const res = await api.step(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setOutput(res.output || []);
    setDetail((prev) => ({
      ...(prev || {}),
      ...(res.detail || {}),
      state_info: res.state_info || prev?.state_info || null, // ✅ NEW
    }));
    setMemoryKB(res.memory_kb || 0);

    setPc(res.pc || 0);

    if (res.done === true) {
      setFinished(true);
    }

    if (res.success === false && res.error) {
      setError({
        type: "debug",
        message: res.error,
        line: res.line,
      });
      setActiveInspector("problems");
    }
  };

  // ===============================
  // STEP (legacy compatibility)
  // ===============================
  const step = async () => {
    return next();
  };

  // ===============================
  // EDITOR HELPERS
  // ===============================
  const jumpToLine = (line) => {};

  // ===============================
  // EXPOSE PUBLIC API
  // ===============================
  return {
    // editor
    code,
    setCode,

    // ui state
    mode,
    loading,
    finished,

    // runtime data
    env,
    trace,
    output,
    detail,
    memoryKB,

    // old errors
    error,
    warning,
    warnings,

    // new problems
    problems,
    summary,

    pc,

    // debug
    sessionId,
    debugKey,

    // actions
    run,
    runWithCode,
    activeInspector,
    setActiveInspector,
    submitInput,

    // debug actions
    debug,
    rerunDebug,
    back,
    next,
    step,

    jumpToLine,
  };
}
