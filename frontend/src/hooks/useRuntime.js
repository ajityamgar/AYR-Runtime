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

  const [env, setEnv] = useState({});
  const [trace, setTrace] = useState([]);
  const [output, setOutput] = useState([]);

  // ✅ NEW: detail + memory support for Inspector tabs
  const [detail, setDetail] = useState({});
  const [memoryKB, setMemoryKB] = useState(0);

  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null); // input/info
  const [warnings, setWarnings] = useState([]);

  const [pc, setPc] = useState(0);
  const [finished, setFinished] = useState(false);

  const submitInput = async (value) => {
    console.log("SUBMIT INPUT → BACKEND:", value, sessionId);

    const res = await api.input(sessionId, value);

    console.log("INPUT RESPONSE:", res);

    setOutput(res.output || []);
    setEnv(res.env || {});
    setTrace(res.trace || []);
    setDetail(res.detail || {});
    setMemoryKB(res.memory_kb || 0);

    setWarning(null);

    if (res.need_input) {
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
    }
  };

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

    // ✅ clear new inspector data
    setDetail({});
    setMemoryKB(0);
  };

  // ===============================
  // ▶ RUN WITH EXTERNAL CODE (FILES)
  // ===============================
  const runWithCode = async (codeToRun) => {
    resetDebuggerUI();
    clearRunUI();

    setMode("run");
    setLoading(true);

    try {
      const res = await api.run(codeToRun);

      setOutput(res.output || []);
      setWarnings(res.warnings || []);
      setEnv(res.env || {});
      setTrace(res.trace || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      if (res.success === false) {
        if (res.need_input) {
          setSessionId(res.session_id);
          setWarning({
            type: "input",
            line: res.line,
            message: res.message || "Program is waiting for input",
          });
          setError(null);
        } else {
          setError({
            type: "run",
            line: res.line,
            message: res.error,
          });
          setWarning(null);
        }
      } else {
        setError(null);
        setWarning(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ▶ RUN (NORMAL EXECUTION – OLD)
  // ===============================
  const run = async () => {
    resetDebuggerUI();
    clearRunUI();

    setMode("run");
    setLoading(true);

    try {
      const res = await api.run(code);

      setOutput(res.output || []);
      setWarnings(res.warnings || []);
      setEnv(res.env || {});
      setTrace(res.trace || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      if (res.success === false) {
        setError({
          type: "run",
          message: res.error,
          line: res.line,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🐞 DEBUG (SESSION CREATE)
  // ===============================
  const debug = async () => {
    clearRunUI();

    setMode("debug");
    setLoading(true);

    try {
      const res = await api.debug(code);

      setSessionId(res.session_id);
      setEnv(res.env || {});
      setTrace(res.trace || []);
      setOutput(res.output || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      setPc(res.pc || 0);
      setFinished(false);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ⏭ STEP (DEBUG ONLY)
  // ===============================
  const step = async () => {
    if (!sessionId || mode !== "debug" || finished) return;

    const res = await api.step(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setOutput(res.output || []);
    setDetail(res.detail || {});
    setMemoryKB(res.memory_kb || 0);

    setPc(res.pc);

    if (res.finished) {
      setFinished(true);
    }

    if (res.error) {
      setError({
        type: "debug",
        message: res.error,
        line: res.line,
      });
    }
  };

  // ===============================
  // ⏮ BACK / ⏩ NEXT (DEBUG)
  // ===============================
  const back = async () => {
    if (!sessionId || mode !== "debug") return;
    const res = await api.back(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setDetail(res.detail || {});
    setMemoryKB(res.memory_kb || 0);
  };

  const next = async () => {
    if (!sessionId || mode !== "debug") return;
    const res = await api.next(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setDetail(res.detail || {});
    setMemoryKB(res.memory_kb || 0);
  };

  // ===============================
  // EDITOR HELPERS
  // ===============================
  const jumpToLine = (line) => {
    // future: editor reveal line
  };

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
    error,
    warning,
    warnings,
    pc,

    // actions
    run,
    runWithCode,
    activeInspector,
    setActiveInspector,
    submitInput,
    debug,
    step,
    back,
    next,
    jumpToLine,
  };
}
