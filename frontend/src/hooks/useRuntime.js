import { useState } from "react";
import api from "../services/api";

export default function useRuntime() {
  const [code, setCode] = useState("");
  const [activeInspector, setActiveInspector] = useState("output");

  const [mode, setMode] = useState("idle");
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState(null);

  const [debugKey, setDebugKey] = useState(null);

  const [env, setEnv] = useState({});
  const [trace, setTrace] = useState([]);
  const [output, setOutput] = useState([]);

  const [detail, setDetail] = useState({});
  const [memoryKB, setMemoryKB] = useState(0);

  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const [problems, setProblems] = useState([]);
  const [summary, setSummary] = useState({
    total_errors: 0,
    total_warnings: 0,
    total_bugs: 0,
    total_problems: 0,
  });

  const [pc, setPc] = useState(0);
  const [finished, setFinished] = useState(false);

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

   const buildProblemFromDebugError = (res) => {
    let msg = String(res?.error || "Unknown error");

    let expr = res?.expression;
    if (!expr) {
      const m = msg.match(/Expression:\s*(.+)/);
      if (m && m[1]) expr = m[1].trim();
    }

    if (typeof res?.line === "number") {
      const prefix = `Expression Error (Line ${res.line}):`;
      if (msg.startsWith(prefix)) {
        msg = msg.slice(prefix.length).trim();
      }
    }

    if (expr) {
      const exprText = `Expression: ${expr}`;
      if (msg.includes(exprText)) {
        msg = msg.replace(exprText, "").trim();
      }
    }

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

  const runWithCode = async (codeToRun) => {
    resetDebuggerUI();
    clearRunUI();

    setMode("run");
    setLoading(true);

    try {
      const res = await api.run(codeToRun);

      setWarnings(res.warnings || []);
      setEnv(res.env || {});
      setTrace(res.trace || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

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

      if (res.success === false && (res.need_input || res.needs_input)) {
        setSessionId(res.session_id);
        setWarning({
          type: "input",
          line: res.line,
          message: res.message || "Program is waiting for input",
        });
        setError(null);

        setOutput(res.output || []);
        setProblems(problemsFromBackend || []);
        setActiveInspector("output");
        return;
      }

      if (res.success === false && hasProblems) {
        setProblems(problemsFromBackend);
        setOutput([]);
        setError(null);
        setWarning(null);
        setActiveInspector("problems");
        return;
      }

      if (res.success === true) {
        setOutput(res.output || []);
        setProblems([]);
        setError(null);
        setWarning(null);
        setActiveInspector("output");
        return;
      }

      setOutput(res.output || []);
      setProblems(problemsFromBackend || []);
      if (hasProblems) setActiveInspector("problems");
    } finally {
      setLoading(false);
    }
  };

  const run = async () => {
    return runWithCode(code);
  };

  const debug = async (newDebugKey, codeToDebug) => {
    clearRunUI();

    setMode("debug");
    setLoading(true);

    try {
      setDebugKey(newDebugKey);

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

      const res = await api.nextError(start.session_id, newDebugKey);

      setEnv(res.env || {});
      setTrace(res.trace || []);
      setOutput(res.output || []);
      setDetail(res.detail || {});
      setMemoryKB(res.memory_kb || 0);

      setPc(res.pc || 0);

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

  const back = async () => {
    if (!sessionId || mode !== "debug") return;

    const res = await api.back(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setDetail((prev) => ({
      ...(prev || {}),
      state_info: res.state_info || null,
    }));
    setMemoryKB(res.memory_kb || 0);
  };

  const next = async () => {
    if (!sessionId || mode !== "debug" || finished) return;

    const res = await api.step(sessionId);

    setEnv(res.env || {});
    setTrace(res.trace || []);
    setOutput(res.output || []);
    setDetail((prev) => ({
      ...(prev || {}),
      ...(res.detail || {}),
      state_info: res.state_info || prev?.state_info || null,
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

  const step = async () => {
    return next();
  };

  const jumpToLine = (line) => {};

  return {
    code,
    setCode,

    mode,
    loading,
    finished,

    env,
    trace,
    output,
    detail,
    memoryKB,

    error,
    warning,
    warnings,

    problems,
    summary,

    pc,

    sessionId,
    debugKey,

    run,
    runWithCode,
    activeInspector,
    setActiveInspector,
    submitInput,

    debug,
    rerunDebug,
    back,
    next,
    step,

    jumpToLine,
  };
}
