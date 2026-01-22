import React from "react";
import Output from "./Output";
import Timeline from "./Timeline";
import EnvViewer from "./EnvViewer";

export default function InspectorPanel({ active, runtime }) {
  // ✅ OUTPUT TAB
  if (active === "output") {
    return (
      <Output
        output={runtime.output}
        warning={runtime.warning}
        onSubmitInput={runtime.submitInput}
      />
    );
  }

  // ✅ PROBLEMS TAB
  if (active === "problems") {
    const problems = Array.isArray(runtime.problems) ? runtime.problems : [];

    const fallbackWarnings = Array.isArray(runtime.warnings)
      ? runtime.warnings
      : [];
    const fallbackHasError = Boolean(runtime.error);

    const hasProblems =
      problems.length > 0 || fallbackHasError || fallbackWarnings.length > 0;

    // ✅ helper to clean duplicate message text
    const normalizeProblemMessage = (p) => {
      const raw = String(p?.message || "Unknown problem");
      const title = String(p?.title || "").trim();

      let msg = raw;

      // remove duplicate title prefix if present in message
      if (title && msg.startsWith(title)) {
        msg = msg.slice(title.length).trim();
      }

      // remove "Expression: xxx" from message (we show it separately)
      const expr = p?.expression ? String(p.expression) : null;
      if (expr) {
        const exprText = `Expression: ${expr}`;
        if (msg.includes(exprText)) {
          msg = msg.replace(exprText, "").trim();
        }
      }

      // remove extra leading ":" if leftover
      if (msg.startsWith(":")) msg = msg.slice(1).trim();

      return msg;
    };

    return (
      <>
        {/* ✅ NEW unified problems */}
        {problems.length > 0 &&
          problems.map((p, i) => {
            const kind = p.kind || "error";
            const title = p.title || "Problem:";
            const expression = p.expression;
            const line = p.line;

            const message = normalizeProblemMessage(p);

            const boxStyle =
              kind === "warning"
                ? { background: "#3a3a1d", color: "#f9c74f" }
                : kind === "bug"
                ? { background: "#3a1d1d", color: "#ffadad" }
                : { background: "#3a1d1d", color: "#ff6b6b" };

            // ✅ Expression Error detection (for UI formatting)
            const isExpressionError =
              typeof title === "string" && title.startsWith("Expression Error");

            return (
              <div
                key={i}
                style={{
                  ...boxStyle,
                  padding: 10,
                  borderTop: "1px solid #555",
                  fontFamily: "monospace",
                }}
              >
               

                {message ? (
                  <div style={{ marginTop: 6, paddingLeft: 14 }}>
                    {String(message)}
                  </div>
                ) : null}

                {/* ✅ Expression on new line */}
                {expression ? (
                  <div style={{ marginTop: 6, paddingLeft: 14, opacity: 0.95 }}>
                    Expression: {String(expression)}
                  </div>
                ) : null}

                {/* ✅ Hide "Line: X" for Expression Error (because title already has line) */}
                {!isExpressionError &&
                line !== undefined &&
                line !== null ? (
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    Line: {line}
                  </div>
                ) : null}
              </div>
            );
          })}

        {/* ✅ OLD fallback: runtime.error */}
        {problems.length === 0 && runtime.error && <ErrorBox error={runtime.error} />}

        {problems.length === 0 &&
        fallbackWarnings.map((w, i) => (
          <div
            key={i}
            style={{
              background: "#3a3a1d",
              color: "#f9c74f",
              padding: 8,
              borderTop: "1px solid #555",
              fontFamily: "monospace",
            }}
          >
            ⚠ {typeof w === "string" ? w : w?.message || JSON.stringify(w)}
          </div>
        ))}

        {!hasProblems && (
          <div style={{ padding: 12, color: "#888" }}>No problems detected</div>
        )}
      </>
    );
  }

  // ✅ TIMELINE TAB
  if (active === "timeline") {
    return <Timeline trace={runtime.trace || []} onJump={runtime.jumpToLine} />;
  }

  // ✅ VARIABLES TAB
  if (active === "variables") {
    return <EnvViewer env={runtime.env || {}} />;
  }

   // ✅ DETAIL TAB
  if (active === "detail") {
    const detail = runtime.detail || {};
    const stateInfo = detail.state_info || null;

    const totalStates =
      stateInfo && typeof stateInfo.total_states === "number"
        ? stateInfo.total_states
        : null;

    const currentIndex =
      stateInfo && typeof stateInfo.current_index === "number"
        ? stateInfo.current_index
        : null;

    const hasPast =
      stateInfo && typeof stateInfo.has_past === "boolean"
        ? stateInfo.has_past
        : null;

    const hasFuture =
      stateInfo && typeof stateInfo.has_future === "boolean"
        ? stateInfo.has_future
        : null;

    const showStateInfo =
      totalStates !== null &&
      currentIndex !== null &&
      hasPast !== null &&
      hasFuture !== null;

    return (
      <div style={{ padding: 12, color: "#d4d4d4", fontFamily: "monospace" }}>
        <div style={{ color: "#4FC1FF", fontWeight: "bold" }}>DETAIL</div>
        <hr style={{ borderColor: "#333" }} />

        {/* ✅ formatted STATE INFO */}
        {showStateInfo && (
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            <div style={{ fontWeight: "bold" }}>📊 STATE INFO</div>
            <div>Total States : {totalStates}</div>
            <div>Current Index: {currentIndex}</div>
            <div>Has Past     : {String(hasPast).toUpperCase()}</div>
            <div>Has Future   : {String(hasFuture).toUpperCase()}</div>
          </div>
        )}

        {/* ✅ fallback JSON */}
        {!showStateInfo && (
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {JSON.stringify(detail, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // ✅ MEMORY TAB
  if (active === "memory") {
    return (
      <div style={{ padding: 12, color: "#d4d4d4", fontFamily: "monospace" }}>
        <div style={{ color: "#4FC1FF", fontWeight: "bold" }}>MEMORY</div>
        <hr style={{ borderColor: "#333" }} />
        <div>Memory Usage: {runtime.memoryKB ?? 0} KB</div>
      </div>
    );
  }

  // ✅ DEBUG TAB
  if (active === "debug") {
    return (
      <div style={{ padding: 12, color: "#aaa", fontFamily: "monospace" }}>
        Debug inspector will appear here
      </div>
    );
  }

  return (
    <div style={{ padding: 12, color: "#aaa", fontFamily: "monospace" }}>
      {active.toUpperCase()} inspector will appear here
    </div>
  );
}
