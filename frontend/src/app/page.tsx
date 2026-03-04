"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, FileArchive, LogOut } from "lucide-react";
import Link from "next/link";
import UploadDropzone from "@/components/UploadDropzone";
import ConversionTimeline from "@/components/ConversionTimeline";
import { uploadPdf, streamStatus, type ConversionStatus } from "@/lib/api";
import { logoutUser } from "@/lib/auth";
import { useAppStore } from "@/lib/store";

import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import AdfMindMap from "@/components/landing/AdfMindMap";
import StatsSection from "@/components/landing/StatsSection";
import GraphPreview from "@/components/landing/GraphPreview";
import BeforeAfter from "@/components/landing/BeforeAfter";
import BottomCta from "@/components/landing/BottomCta";

export default function HomePage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [conversionStatus, setConversionStatus] =
    useState<ConversionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setJobId, user, setUser, token } = useAppStore();

  const handleRetry = useCallback(() => {
    setConversionStatus(null);
    setError(null);
    setIsUploading(false);
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      try {
        const { job_id } = await uploadPdf(file, token);
        setJobId(job_id);
        setIsUploading(false);

        streamStatus(
          job_id,
          (status) => setConversionStatus(status),
          () => {
            setTimeout(() => router.push(`/doc/${job_id}`), 800);
          },
          (errMsg) => {
            setError(errMsg || "Conversion failed. Please try again.");
          },
          token
        );
      } catch (err) {
        setIsUploading(false);
        setError(
          err instanceof Error ? err.message : "Upload failed. Please try again."
        );
      }
    },
    [router, setJobId, token]
  );

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
  }, [setUser, router]);

  if (conversionStatus) {
    return (
      <main className="min-h-screen flex flex-col">
        <Nav user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          <div className="w-full max-w-2xl">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold text-center mb-8"
            >
              {error ? "Conversion failed" : "Converting your document..."}
            </motion.h2>
            <ConversionTimeline status={conversionStatus} />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-5 py-2 rounded-lg bg-white/10 border border-white/10 text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Try another file
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Nav user={user} onLogout={handleLogout} />

      {/* Hero */}
      <HeroSection>
        <UploadDropzone
          onFileSelected={handleFileSelected}
          isUploading={isUploading}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-center max-w-md"
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 text-xs text-white/40 hover:text-white/70 underline transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Link
            href="/viewer"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <FileArchive className="w-4 h-4" />
            Or open an existing .adf file
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-8 md:gap-12 text-center"
        >
          <div>
            <span className="text-2xl font-bold text-blue-400">78%</span>
            <p className="text-[10px] text-white/30 mt-0.5">Faster</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-2xl font-bold text-green-400">96%</span>
            <p className="text-[10px] text-white/30 mt-0.5">Accurate</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-2xl font-bold text-purple-400">5</span>
            <p className="text-[10px] text-white/30 mt-0.5">AI Layers</p>
          </div>
        </motion.div>
      </HeroSection>

      {/* Visual/interactive sections first */}
      <HowItWorks />
      <AdfMindMap />
      <GraphPreview />
      <StatsSection />
      <BeforeAfter />

      {/* Bottom CTA */}
      <BottomCta>
        <UploadDropzone
          onFileSelected={handleFileSelected}
          isUploading={isUploading}
        />
      </BottomCta>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-8 text-center">
        <p className="text-xs text-white/20">
          Agent Document Format &mdash; Open standard for AI-native documents
        </p>
      </footer>
    </main>
  );
}

function Nav({
  user,
  onLogout,
}: {
  user: { email: string } | null;
  onLogout: () => void;
}) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0B0D12]/80 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Brain className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">ADF</span>
      </div>
      <div className="flex items-center gap-5 text-sm">
        <a
          href="#how-it-works"
          className="text-white/40 hover:text-white/80 transition-colors hidden md:block"
        >
          How it Works
        </a>
        <a
          href="#mind-map"
          className="text-white/40 hover:text-white/80 transition-colors hidden md:block"
        >
          Anatomy
        </a>
        <a
          href="#graph"
          className="text-white/40 hover:text-white/80 transition-colors hidden md:block"
        >
          Graph
        </a>
        <Link
          href="/viewer"
          className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors"
        >
          <FileArchive className="w-3.5 h-3.5" />
          Open ADF
        </Link>
        {user && (
          <>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-white/30 text-xs">{user.email}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

