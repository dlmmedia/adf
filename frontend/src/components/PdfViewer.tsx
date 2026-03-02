"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfViewerProps {
  pdfUrl: string;
  className?: string;
}

export default function PdfViewer({ pdfUrl, className }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasks = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      try {
        const doc = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  const renderPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement) => {
      if (!pdfDoc) return;

      const existing = renderTasks.current.get(pageNum);
      if (existing) {
        try { existing.cancel(); } catch {}
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale * window.devicePixelRatio });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;
      canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = page.render({ canvasContext: ctx, viewport });
      renderTasks.current.set(pageNum, task);

      try {
        await task.promise;
      } catch {}
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (!pdfDoc) return;
    canvasRefs.current.forEach((canvas, pageNum) => {
      renderPage(pageNum, canvas);
    });
  }, [pdfDoc, scale, renderPage]);

  const setCanvasRef = useCallback(
    (pageNum: number) => (el: HTMLCanvasElement | null) => {
      if (el) {
        canvasRefs.current.set(pageNum, el);
        renderPage(pageNum, el);
      } else {
        canvasRefs.current.delete(pageNum);
      }
    },
    [renderPage]
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const children = container.querySelectorAll("[data-page]");
    let closest = 1;
    let minDist = Infinity;

    children.forEach((child) => {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerRect.top);
      if (dist < minDist) {
        minDist = dist;
        closest = parseInt(child.getAttribute("data-page") || "1");
      }
    });
    setCurrentPage(closest);
  }, []);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02] shrink-0">
        <span className="text-sm text-white/50">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-white/50 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF pages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-neutral-900/50 p-6"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RotateCw className="w-8 h-8 text-white/30 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                data-page={pageNum}
                className="shadow-2xl bg-white rounded"
              >
                <canvas ref={setCanvasRef(pageNum)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
