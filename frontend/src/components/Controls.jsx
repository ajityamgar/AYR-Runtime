import React from "react";

export default function Header({ run, debug, step, back, next }) {
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

      {/* CENTER */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#4FC1FF",
          fontSize: 16,
          letterSpacing: 1,
        }}
      >
        AYR Runtime
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={debug}>🐞 Debug</button>
        <button onClick={step}>⏭ Step</button>
        <button onClick={back}>⬅ Back</button>
        <button onClick={next}>➡ Next</button>
      </div>
    </div>
  );
}
