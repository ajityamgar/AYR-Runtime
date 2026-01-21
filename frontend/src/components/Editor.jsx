import React from "react";
import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

const KEYWORDS = [
  "dikhao","agar","warna","jabtak","kaam","wapas",
  "har","main","band","chalu","true","false","nahi","pucho","class"
];

export default function AYREditor({
  code,
  setCode,
  errorLine,
  execLine,
  warnings
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  function onMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 1️⃣ Register language
    monaco.languages.register({ id: "ayr" });

    // 2️⃣ Syntax highlighting (safe)
    monaco.languages.setMonarchTokensProvider("ayr", {
      tokenizer: {
        root: [
          [new RegExp(`\\b(${KEYWORDS.join("|")})\\b`), "keyword"],
          [/[0-9]+/, "number"],
          [/".*?"/, "string"],
        ],
      },
    });

    // 3️⃣ Use built-in VS Code dark theme (NO custom theme yet)
    monaco.editor.setTheme("vs-dark");
  }

  // ❌ Error + ⚠️ Warning underline
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = [];

    if (errorLine) {
      markers.push({
        startLineNumber: errorLine,
        startColumn: 1,
        endLineNumber: errorLine,
        endColumn: 200,
        message: "Runtime Error",
        severity: monacoRef.current.MarkerSeverity.Error,
      });
    }

    warnings.forEach(w => {
      markers.push({
        startLineNumber: w.line,
        startColumn: 1,
        endLineNumber: w.line,
        endColumn: 200,
        message: w.message,
        severity: monacoRef.current.MarkerSeverity.Warning,
      });
    });

    monacoRef.current.editor.setModelMarkers(model, "ayr", markers);
  }, [errorLine, warnings]);

  return (
    <Editor
      height="100%"
      language="ayr"
      value={code}
      onChange={setCode}
      onMount={onMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false
      }}
    />
  );
}
