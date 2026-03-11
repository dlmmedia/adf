import { useState, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { useAdf } from "@app/contexts/AdfContext";
import { ConversionTimeline } from "@app/components/adf";
import { convertPdfToAdf, type ConversionProgress } from "@app/services/adfConverter";
import type { ConversionStatus } from "@app/types/adf";

type ConvertState = "idle" | "converting" | "done" | "error";

export default function ConvertToAdf() {
  const { loadAdf } = useAdf();
  const [state, setState] = useState<ConvertState>("idle");
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const downloadUrlRef = useRef<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setState("idle");
      setErrorMessage("");
    }
  }, []);

  const progressToStatus = (update: ConversionProgress): ConversionStatus => ({
    job_id: "local",
    status: update.step === "done" ? "completed" : "processing",
    step: update.step,
    progress: update.progress,
    sections_detected: 0,
    entities_extracted: 0,
    confidence: 0,
    message: update.message,
  });

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    setState("converting");
    setErrorMessage("");

    try {
      const result = await convertPdfToAdf(selectedFile, (update) => {
        setConversionStatus(progressToStatus(update));
      });

      // Update final status with actual data
      setConversionStatus({
        job_id: "local",
        status: "completed",
        step: "done",
        progress: 1.0,
        sections_detected: result.semantic.sections.length,
        entities_extracted: result.agentMeta.entities.length,
        confidence: result.agentMeta.confidence,
        message: "Conversion complete!",
      });

      // Create download URL
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
      const blobUrl = URL.createObjectURL(result.adfBlob);
      downloadUrlRef.current = blobUrl;
      setDownloadUrl(blobUrl);

      // Load into the ADF viewer
      const adfFileName = selectedFile.name.replace(/\.pdf$/i, "") + ".adf";
      const adfFile = new File([result.adfBlob], adfFileName, { type: "application/zip" });
      await loadAdf(adfFile);

      setState("done");
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Conversion failed");
    }
  }, [selectedFile, loadAdf]);

  const handleDownload = useCallback(() => {
    if (!downloadUrl || !selectedFile) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = selectedFile.name.replace(/\.pdf$/i, "") + ".adf";
    a.click();
  }, [downloadUrl, selectedFile]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Icon icon="material-symbols:transform" className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Convert to ADF</h2>
          <p className="text-sm text-white/50">Transform a PDF into an Agent Document Format file</p>
        </div>
      </div>

      {state === "idle" && (
        <div className="space-y-4">
          <label className="block w-full p-8 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 transition-colors cursor-pointer text-center">
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            <Icon icon="material-symbols:upload-file-outline" className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/50">
              {selectedFile ? selectedFile.name : "Select a PDF file to convert"}
            </p>
          </label>

          {selectedFile && (
            <button
              onClick={handleConvert}
              className="w-full py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="material-symbols:play-arrow" className="w-5 h-5" />
              Convert to ADF
            </button>
          )}
        </div>
      )}

      {state === "converting" && conversionStatus && (
        <ConversionTimeline status={conversionStatus} />
      )}

      {state === "converting" && !conversionStatus && (
        <div className="text-center py-8">
          <Icon icon="material-symbols:progress-activity" className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-white/60">Starting conversion...</p>
        </div>
      )}

      {state === "done" && (
        <div className="text-center py-8">
          <Icon icon="material-symbols:check-circle-outline" className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-white/90 mb-1">Conversion Complete</p>
          <p className="text-sm text-white/50">Your ADF file is ready. The viewer has been updated with the new document.</p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/70 hover:bg-white/[0.08] transition-colors"
          >
            <Icon icon="material-symbols:download" className="w-4 h-4" />
            Download .adf
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="text-center py-8">
          <Icon icon="material-symbols:error-outline" className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-white/90 mb-1">Conversion Failed</p>
          <p className="text-sm text-red-400/70">{errorMessage}</p>
          <button
            onClick={() => { setState("idle"); setConversionStatus(null); }}
            className="mt-4 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/70 hover:bg-white/[0.08] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
