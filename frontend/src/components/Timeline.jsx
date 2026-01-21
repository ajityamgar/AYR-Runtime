import React from "react";

export default function Timeline({ trace, onJump }) {
  const items = Array.isArray(trace) ? trace : [];

  return (
    <div style={{ padding: 12, fontFamily: "monospace", color: "#d4d4d4" }}>
      <div style={{ color: "#4FC1FF", fontWeight: "bold" }}>🕒 TIMELINE</div>
      <hr style={{ borderColor: "#333" }} />

      {items.length === 0 && (
        <div style={{ opacity: 0.6 }}>No timeline data</div>
      )}

      {items.map((t, idx) => {
        // ✅ support both string trace + object trace
        if (typeof t === "string") {
          return (
            <div
              key={idx}
              style={{
                padding: "6px 0",
                borderBottom: "1px solid #222",
                cursor: "pointer",
              }}
              onClick={() => onJump?.(null)}
            >
              [{idx}] {t}
            </div>
          );
        }

        const i = typeof t.i === "number" ? t.i : idx;
        const line = t.line;
        const env = t.env || {};

        return (
          <div
            key={idx}
            style={{
              padding: "6px 0",
              borderBottom: "1px solid #222",
              cursor: line ? "pointer" : "default",
            }}
            onClick={() => {
              if (line) onJump?.(line);
            }}
          >
            <div>
              [{i}]{" "}
              {line ? (
                <>
                  line:{line}{" "}
                  <span style={{ color: "#9cdcfe" }}>
                    {JSON.stringify(env)}
                  </span>
                </>
              ) : (
                <span style={{ color: "#9cdcfe" }}>{JSON.stringify(env)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
