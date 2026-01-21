import React, { useState } from "react";

export default function Output({ output, warning, onSubmitInput }) {
  const [inputValue, setInputValue] = useState("");

  const submit = () => {
    if (!inputValue.trim()) return;
    onSubmitInput(inputValue);
    setInputValue("");
  };

  return (
    <div
      style={{
        background: "#1e1e1e",
        color: "#d4d4d4",
        padding: 10,
        fontFamily: "monospace",
        fontSize: 13,
        overflowY: "auto",
        height: "100%",
      }}
    >
      {/* OUTPUT */}
      {output.length === 0 && (
        <div style={{ opacity: 0.5 }}>No output</div>
      )}

      {output.map((line, i) => (
        <div key={i}>{String(line)}</div>
      ))}

      {/* INPUT AS NEXT OUTPUT LINE */}
      {warning?.type === "input" && (
        <div style={{ marginTop: 6 }}>
          <span style={{ color: "#4FC1FF" }}>{"> "}</span>
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={`input (line ${warning.line})`}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 13,
              width: "80%",
            }}
          />
        </div>
      )}
    </div>
  );
}