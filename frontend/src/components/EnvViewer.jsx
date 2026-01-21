import React from "react";

export default function EnvViewer({ env }) {
  return (
    <div style={{
      background: "#252526",
      color: "#d4d4d4",
      padding: 10,
      fontFamily: "monospace",
      fontSize: 13,
      overflowY: "auto",
      borderLeft: "1px solid #333"
    }}>
      <div style={{ color: "#4FC1FF" }}>🧪 VARIABLES</div>
      <hr />
      {Object.keys(env).length === 0 && (
        <div style={{ opacity: 0.6 }}>No variables</div>
      )}
      {Object.entries(env).map(([key, value]) => (
        <div key={key}>
          <span style={{ color: "#9CDCFE" }}>{key}</span>
          <span> = </span>
          <span style={{ color: "#CE9178" }}>
            {JSON.stringify(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
