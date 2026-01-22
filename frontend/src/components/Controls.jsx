import React from "react";

export default function Controls({
  run,
  debug,

  rerunDebug,
  back,
  next,

  mode,

  onBrandClick,
}) {
  const isDebug = mode === "debug";

  return (
    <div
      style={{
        height: 44,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        padding: "0 10px",
        background: "#1e1e1e",
        borderBottom: "1px solid #333",
        fontFamily: "monospace",
      }}
    >
      {/* LEFT */}
      <div>
        <button onClick={run}>▶ Run</button>
      </div>

      {/* CENTER (CLICKABLE) */}
      <div
        onClick={onBrandClick}
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#4FC1FF",
          fontSize: 16,
          letterSpacing: 1,
          cursor: "pointer",
          userSelect: "none",
        }}
        title="Go to Home"
      >
        AYR Runtime
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", gap: 6 }}>
        {!isDebug && <button onClick={debug}>🐞 Debug</button>}

        {isDebug && (
          <>
            <button onClick={rerunDebug}>🔁 Re-run</button>
            <button onClick={back}>⬅ Back</button>
            <button onClick={next}>➡ Next</button>
          </>
        )}
      </div>
    </div>
  );
}
