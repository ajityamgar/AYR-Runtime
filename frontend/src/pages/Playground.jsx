import React, { useEffect, useMemo, useState } from "react";
import Editor from "../components/Editor";
import Controls from "../components/Controls";
import FileExplorer from "../components/FileExplorer";
import InspectorTabs from "../components/InspectorTabs";
import InspectorPanel from "../components/InspectorPanel";
import { useNavigate } from "react-router-dom";
import useRuntime from "../hooks/useRuntime";

const MIN_SIDEBAR_WIDTH = 140;
const MIN_BOTTOM_HEIGHT = 140;
const DEFAULT_SIDEBAR_WIDTH = 220;
const DEFAULT_BOTTOM_HEIGHT = 220;



export default function Playground() {
  const runtime = useRuntime();
  const navigate = useNavigate();
  // ---------- FILES ----------
  const [files, setFiles] = useState([
    { id: "main", name: "main.ayr", code: "" },
  ]);
  const [activeFileId, setActiveFileId] = useState("main");

  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0];
  }, [files, activeFileId]);

  // ---------- UI STATE ----------
  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [bottomHeight, setBottomHeight] = useState(DEFAULT_BOTTOM_HEIGHT);
  const [activeBottomTab, setActiveBottomTab] = useState("output");

  // ✅ Auto-sync bottom tab with runtime inspector (if runtime asks)
  useEffect(() => {
    if (!runtime.activeInspector) return;
    setActiveBottomTab(runtime.activeInspector);
  }, [runtime.activeInspector]);

  // ---------- FILE ACTIONS ----------
  const createNewFile = (rawName) => {
    let name = (rawName || "").trim();
    if (!name) return { error: "Empty name" };

    if (!name.endsWith(".ayr")) name += ".ayr";

    const alreadyExists = files.some(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) return { error: "File exists" };

    const id = crypto.randomUUID();
    setFiles((prev) => [...prev, { id, name, code: "" }]);
    setActiveFileId(id);

    return { success: true };
  };

  const deleteFile = (id) => {
    if (files.length === 1) return;

    setFiles((prev) => {
      const remaining = prev.filter((f) => f.id !== id);

      if (id === activeFileId) {
        setActiveFileId(remaining[0]?.id || "main");
      }

      return remaining;
    });
  };

  // ---------- COUNTS ----------
  const problemsFromBackend = Array.isArray(runtime.problems)
    ? runtime.problems
    : [];

  const summaryProblemCount =
    runtime.summary && typeof runtime.summary.total_problems === "number"
      ? runtime.summary.total_problems
      : null;

  const fallbackErrorCount = runtime.error ? 1 : 0;
  const fallbackWarningCount = runtime.warnings?.length || 0;
  const fallbackProblemCount = fallbackErrorCount + fallbackWarningCount;

  const problemCount =
    summaryProblemCount !== null
      ? summaryProblemCount
      : problemsFromBackend.length > 0
      ? problemsFromBackend.length
      : fallbackProblemCount;

  const hasOutput = Boolean(runtime.output?.length);

  // ---------- RESIZERS ----------
  const startSidebarResize = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (ev) => {
      const nextWidth = startWidth + (ev.clientX - startX);
      setSidebarWidth(Math.max(MIN_SIDEBAR_WIDTH, nextWidth));
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp, { once: true });
  };

  const startBottomResize = (e) => {
    const startY = e.clientY;
    const startHeight = bottomHeight;

    const onMove = (ev) => {
      const nextHeight = startHeight - (ev.clientY - startY);
      setBottomHeight(Math.max(MIN_BOTTOM_HEIGHT, nextHeight));
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp, { once: true });
  };

  // ---------- RUN / DEBUG ----------
  const handleRun = () => {
    runtime.runWithCode(activeFile?.code || "");
  };

  const handleDebugStart = async () => {
    setActiveBottomTab("problems");
    await runtime.debug(activeFile?.id, activeFile?.code || "");
  };

  const handleRerunDebug = async () => {
    setActiveBottomTab("problems");
    await runtime.rerunDebug();
  };

  // ---------- EDITOR ----------
  const updateActiveFileCode = (newCode) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, code: newCode } : f
      )
    );
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <Controls
        run={handleRun}
        debug={handleDebugStart}
        rerunDebug={handleRerunDebug}
        back={runtime.back}
        next={runtime.next}
        mode={runtime.mode}
        onBrandClick={() => navigate("/")}
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

        {/* SIDEBAR RESIZER */}
        <div
          onMouseDown={startSidebarResize}
          style={{
            width: 4,
            cursor: "col-resize",
            background: "#333",
          }}
        />

        {/* EDITOR */}
        <div style={{ flex: 1 }}>
          <Editor code={activeFile?.code || ""} setCode={updateActiveFileCode} />
        </div>
      </div>

      {/* BOTTOM RESIZER */}
      <div
        onMouseDown={startBottomResize}
        style={{
          height: 4,
          cursor: "row-resize",
          background: "#333",
        }}
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