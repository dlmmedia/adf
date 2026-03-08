import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAdf } from "@app/contexts/AdfContext";

type Layer = "semantic" | "agent" | "graph" | "benchmarks";

const LAYERS: { key: Layer; label: string; icon: string }[] = [
  { key: "semantic", label: "semantic.json", icon: "material-symbols:format-list-bulleted" },
  { key: "agent", label: "agent.json", icon: "material-symbols:psychology-outline" },
  { key: "graph", label: "graph.json", icon: "material-symbols:hub-outline" },
  { key: "benchmarks", label: "benchmarks.json", icon: "material-symbols:speed-outline" },
];

export default function AdfInspector() {
  const { isAdfLoaded, document } = useAdf();
  const [activeLayer, setActiveLayer] = useState<Layer>("semantic");
  const [copied, setCopied] = useState(false);

  if (!isAdfLoaded || !document) {
    return (
      <div className="p-6 text-center">
        <Icon icon="material-symbols:folder-open-outline" className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">Open an ADF file to inspect its layers</p>
      </div>
    );
  }

  const layerData: Record<Layer, unknown> = {
    semantic: document.semantic,
    agent: document.agent,
    graph: document.graph,
    benchmarks: document.benchmarks,
  };

  const json = JSON.stringify(layerData[activeLayer], null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a") as unknown as HTMLAnchorElement;
    (a as HTMLAnchorElement).href = url;
    (a as HTMLAnchorElement).download = `${activeLayer}.json`;
    (a as HTMLAnchorElement).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Icon icon="material-symbols:code" className="w-5 h-5 text-white/40" />
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">ADF Inspector</h2>
      </div>

      <div className="flex border-b border-white/10 shrink-0">
        {LAYERS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveLayer(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              activeLayer === key ? "text-blue-400 border-b-2 border-blue-400" : "text-white/40 hover:text-white/60"
            }`}
          >
            <Icon icon={icon} className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
          <Icon icon={copied ? "material-symbols:check" : "material-symbols:content-copy-outline"} className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={handleExport} className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors">
          <Icon icon="material-symbols:download" className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed">{json}</pre>
      </div>
    </div>
  );
}
