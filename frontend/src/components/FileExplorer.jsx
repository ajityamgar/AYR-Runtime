import React, { useState } from "react";

export default function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  search,
  setSearch,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [error, setError] = useState(null);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const submitNewFile = () => {
    const res = onCreateFile(newFileName);

    if (res?.error) {
      setError(res.error);
      return;
    }

    setIsCreating(false);
    setNewFileName("");
    setError(null);
  };

  return (
    <div style={{ fontSize: 13 }}>
      {/* Header */}
      <div
        style={{
          padding: "8px 10px",
          fontWeight: "bold",
          color: "#ccc",
          borderBottom: "1px solid #333",
        }}
      >
        EXPLORER
      </div>

      {/* New File Button */}
      {!isCreating && (
        <div
          onClick={() => setIsCreating(true)}
          style={{
            padding: "6px 10px",
            cursor: "pointer",
            color: "#4FC1FF",
            fontSize: 12,
          }}
        >
          ➕ New File
        </div>
      )}

      {/* Inline New File Input */}
      {isCreating && (
        <div style={{ padding: "6px 10px" }}>
          <input
            autoFocus
            placeholder="filename.ayr"
            value={newFileName}
            onChange={(e) => {
              setNewFileName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNewFile();
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewFileName("");
                setError(null);
              }
            }}
            onBlur={() => {
              setIsCreating(false);
              setNewFileName("");
              setError(null);
            }}
            style={{
              width: "100%",
              background: "#252526",
              color: "#fff",
              border: "1px solid #555",
              padding: "4px",
              fontSize: 12,
            }}
          />

          {error && (
            <div style={{ color: "#f44747", fontSize: 11, marginTop: 4 }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <input
        placeholder="Search files"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "90%",
          margin: "6px",
          background: "#252526",
          color: "#fff",
          border: "1px solid #333",
          padding: "4px",
        }}
      />

      {/* Files */}
      {filteredFiles.map((file) => {
        const active = file.id === activeFileId;

        return (
          <div
            key={file.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              background: active ? "#252526" : "transparent",
              color: active ? "#fff" : "#ccc",
            }}
          >
            <span
              onClick={() => onSelectFile(file.id)}
              style={{ cursor: "pointer" }}
            >
              📄 {file.name}
            </span>

            <span
              onClick={() => onDeleteFile(file.id)}
              style={{ cursor: "pointer", color: "#f44747" }}
            >
              🗑
            </span>
          </div>
        );
      })}

      {filteredFiles.length === 0 && (
        <div style={{ padding: 10, color: "#777" }}>
          No files found
        </div>
      )}
    </div>
  );
}
