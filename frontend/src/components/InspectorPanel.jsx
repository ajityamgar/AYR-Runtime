import React from "react";
import Output from "./Output";
import ErrorBox from "./ErrorBox";
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
    return (
      <>
        {runtime.error && <ErrorBox error={runtime.error} />}

        {runtime.warnings?.map((w, i) => (
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
            ⚠ {String(w)}
          </div>
        ))}

        {!runtime.error && runtime.warnings?.length === 0 && (
          <div style={{ padding: 12, color: "#888" }}>
            No problems detected
          </div>
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
    return (
      <div style={{ padding: 12, color: "#d4d4d4", fontFamily: "monospace" }}>
        <div style={{ color: "#4FC1FF", fontWeight: "bold" }}>DETAIL</div>
        <hr style={{ borderColor: "#333" }} />
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {JSON.stringify(detail, null, 2)}
        </pre>
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

  // ✅ DEBUG TAB (optional placeholder for now)
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
