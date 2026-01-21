import React from "react";

export default function InspectorTabs({
  active,
  setActive,
  problemCount,
  hasOutput,
}) {
  const tabs = [
    { id: "problems", label: "Problems", badge: problemCount },
    { id: "output", label: "Output", glow: hasOutput },
    { id: "debug", label: "Debug" },
    { id: "timeline", label: "Timeline" },
    { id: "detail", label: "Detail" },
    { id: "memory", label: "Memory" },
    { id: "variables", label: "Variables" },
  ];

  return (
    <div style={{ display: "flex", borderBottom: "1px solid #333" }}>
      {tabs.map((t) => (
        <div
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{
            padding: "6px 12px",
            cursor: "pointer",
            background: active === t.id ? "#252526" : "#1e1e1e",
            color: active === t.id ? "#fff" : "#aaa",
            borderRight: "1px solid #333",
            boxShadow: t.glow ? "inset 0 -2px #007acc" : "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {t.label}
          {t.badge > 0 && (
            <span
              style={{
                background: "#007acc",
                color: "#fff",
                borderRadius: 10,
                padding: "0 6px",
                fontSize: 12,
              }}
            >
              {t.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
