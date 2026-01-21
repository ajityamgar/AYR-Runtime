import React, { useState } from "react";
import Editor from "../components/Editor";
import Controls from "../components/Controls";
import Output from "../components/Output";
import ErrorBox from "../components/ErrorBox";
import useRuntime from "../hooks/useRuntime";
import FileExplorer from "../components/FileExplorer";
import InspectorTabs from "../components/InspectorTabs";
import InspectorPanel from "../components/InspectorPanel";

export default function Playground() {
  const runtime = useRuntime();

  const [files, setFiles] = useState([
    { id: "main", name: "main.ayr", code: "" },
  ]);

  const [activeFileId, setActiveFileId] = useState("main");
  const activeFile = files.find((f) => f.id === activeFileId);

  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [bottomHeight, setBottomHeight] = useState(220);
  const [activeBottomTab, setActiveBottomTab] = useState("output");

  // ---------- FILE ACTIONS ----------
  const createNewFile = (rawName) => {
    let name = rawName.trim();
    if (!name) return { error: "Empty name" };
    if (!name.endsWith(".ayr")) name += ".ayr";

    if (files.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      return { error: "File exists" };
    }

    const id = crypto.randomUUID();
    setFiles([...files, { id, name, code: "" }]);
    setActiveFileId(id);
    return { success: true };
  };

  const deleteFile = (id) => {
    if (files.length === 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (id === activeFileId) setActiveFileId(remaining[0].id);
  };

  // ---------- COUNTS ----------
  const errorCount = runtime.error ? 1 : 0;
  const warningCount = runtime.warnings?.length || 0;
  const problemCount = errorCount + warningCount;
  const hasOutput = runtime.output && runtime.output.length > 0;

  // ---------- RESIZE ----------
  const startSidebarResize = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (ev) => {
      setSidebarWidth(Math.max(140, startWidth + ev.clientX - startX));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", () =>
      document.removeEventListener("mousemove", onMove),
      { once: true }
    );
  };

  const startBottomResize = (e) => {
    const startY = e.clientY;
    const startHeight = bottomHeight;

    const onMove = (ev) => {
      setBottomHeight(Math.max(140, startHeight - (ev.clientY - startY)));
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", () =>
      document.removeEventListener("mousemove", onMove),
      { once: true }
    );
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <Controls
        run={() => runtime.runWithCode(activeFile.code)}
        debug={runtime.debug}
        step={runtime.step}
        back={runtime.back}
        next={runtime.next}
      />

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* SIDEBAR */}
        <div
          style={{
            width: sidebarWidth,
            background: "#1e1e1e",
            borderRight: "1px solid #333",
          }}
        >
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onCreateFile={createNewFile}
            onDeleteFile={deleteFile}
            search={search}
            setSearch={setSearch}
          />
        </div>

        <div
          onMouseDown={startSidebarResize}
          style={{ width: 4, cursor: "col-resize", background: "#333" }}
        />

        {/* EDITOR */}
        <div style={{ flex: 1 }}>
          <Editor
            code={activeFile.code}
            setCode={(newCode) =>
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === activeFileId ? { ...f, code: newCode } : f
                )
              )
            }
          />
        </div>
      </div>

      {/* BOTTOM RESIZER */}
      <div
        onMouseDown={startBottomResize}
        style={{ height: 4, cursor: "row-resize", background: "#333" }}
      />

      {/* BOTTOM INSPECTOR */}
      <div
        style={{
          height: bottomHeight,
          background: "#1e1e1e",
          borderTop: "1px solid #333",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <InspectorTabs
          active={activeBottomTab}
          setActive={setActiveBottomTab}
          problemCount={problemCount}
          hasOutput={hasOutput}
        />

        <div style={{ flex: 1, overflow: "auto" }}>
          <InspectorPanel active={activeBottomTab} runtime={runtime} />
        </div>
      </div>
    </div>
  );
}
