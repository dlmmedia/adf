"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Shield, Brain, FileArchive, LogOut } from "lucide-react";
import Link from "next/link";
import UploadDropzone from "@/components/UploadDropzone";
import ConversionTimeline from "@/components/ConversionTimeline";
import { uploadPdf, streamStatus, type ConversionStatus } from "@/lib/api";
import { logoutUser } from "@/lib/auth";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus | null>(null);
  const { setJobId, user, setUser } = useAppStore();

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const { job_id } = await uploadPdf(file);
        setJobId(job_id);
        setIsUploading(false);

        streamStatus(
          job_id,
          (status) => setConversionStatus(status),
          () => {
            setTimeout(() => router.push(`/doc/${job_id}`), 800);
          },
          (err) => console.error(err)
        );
      } catch (err) {
        setIsUploading(false);
        console.error("Upload failed:", err);
      }
    },
    [router, setJobId]
  );

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
  }, [setUser, router]);

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ADF</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/viewer"
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors"
          >
            <FileArchive className="w-3.5 h-3.5" />
            Open ADF
          </Link>
          <span className="text-white/50 hover:text-white/80 cursor-pointer transition-colors">
            Docs
          </span>
          <span className="text-white/50 hover:text-white/80 cursor-pointer transition-colors">
            API
          </span>
          {user && (
            <>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-white/40 text-xs">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        {!conversionStatus ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12 max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
              >
                <Zap className="w-3.5 h-3.5" />
                Agent Document Format
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                Turn documents into{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  intelligent objects
                </span>
              </h1>

              <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
                Convert any PDF into an AI-native knowledge object that agents
                instantly understand, trust, and act on.
              </p>
            </motion.div>

            <UploadDropzone
              onFileSelected={handleFileSelected}
              isUploading={isUploading}
            />

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
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
            >
              <FeatureCard
                icon={<Zap className="w-5 h-5 text-blue-400" />}
                title="78% Faster"
                description="Pre-computed semantic analysis eliminates redundant AI processing."
              />
              <FeatureCard
                icon={<Shield className="w-5 h-5 text-green-400" />}
                title="96% Accurate"
                description="Structure detection with confidence scoring you can trust."
              />
              <FeatureCard
                icon={<Brain className="w-5 h-5 text-purple-400" />}
                title="Agent-Native"
                description="Documents become queryable knowledge objects with built-in intelligence."
              />
            </motion.div>
          </>
        ) : (
          <div className="w-full max-w-2xl">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold text-center mb-8"
            >
              Converting your document...
            </motion.h2>
            <ConversionTimeline status={conversionStatus} />
          </div>
        )}
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}
