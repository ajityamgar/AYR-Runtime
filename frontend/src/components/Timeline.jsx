import React from "react";

export default function Timeline({ trace = [], onJump }) {
  if (!Array.isArray(trace)) {
    trace = [];
  }

  return (
    <div
      style={{
        background: "#1e1e1e",
        color: "#d4d4d4",
        padding: 10,
        fontFamily: "monospace",
        fontSize: 13,
        overflowY: "auto",
        borderLeft: "1px solid #333"
      }}
    >
      <div style={{ color: "#C586C0" }}>🕒 DEBUG TIMELINE</div>
      <hr />

      {trace.length === 0 && (
        <div style={{ opacity: 0.6 }}>No execution trace</div>
      )}

      {trace.map((line, index) => {
        const isError = line.includes("❌");
        const isLoop = line.includes("loop iteration");
        const isFunc = line.includes("↳") || line.includes("↰");

        return (
          <div
            key={index}
            onClick={() => {
              const match = line.match(/line\s+(\d+)/);
              if (match && onJump) {
                onJump(parseInt(match[1], 10));
              }
            }}
            style={{
              cursor: "pointer",
              padding: "2px 4px",
              color: isError
                ? "#f44747"
                : isLoop
                ? "#4FC1FF"
                : isFunc
                ? "#C586C0"
                : "#d4d4d4"
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
}
