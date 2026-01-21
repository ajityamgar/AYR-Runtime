import React from "react";

export default function ErrorBox({ error }) {
  if (!error) return null;

  return (
  
      <pre
        style={{
          whiteSpace: "pre-wrap",
          margin: 0,
          color: "#fff",
        }}
      >
        {error.message}
      </pre>
    )
}
