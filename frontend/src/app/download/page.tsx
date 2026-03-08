"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Monitor,
  Apple,
  Download,
  ExternalLink,
  ArrowLeft,
  HardDrive,
  Cpu,
} from "lucide-react";

const GITHUB_REPO = "dlmmedia/adf";
const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  assets: ReleaseAsset[];
}

interface PlatformDownload {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  asset: ReleaseAsset | null;
  fallbackUrl: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function findAsset(assets: ReleaseAsset[], patterns: string[]): ReleaseAsset | null {
  for (const pattern of patterns) {
    const found = assets.find((a) =>
      a.name.toLowerCase().includes(pattern.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}

export default function DownloadPage() {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setRelease(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const version = release?.tag_name ?? "latest";
  const assets = release?.assets ?? [];

  const platforms: PlatformDownload[] = [
    {
      label: "Windows",
      sublabel: "64-bit (x86_64)",
      icon: <Monitor className="w-8 h-8" />,
      asset: findAsset(assets, ["x64-setup.exe", ".msi"]),
      fallbackUrl: `${RELEASES_URL}/latest`,
    },
    {
      label: "macOS",
      sublabel: "Apple Silicon (M1/M2/M3)",
      icon: <Apple className="w-8 h-8" />,
      asset: findAsset(assets, ["aarch64.dmg"]),
      fallbackUrl: `${RELEASES_URL}/latest`,
    },
    {
      label: "macOS",
      sublabel: "Intel (x86_64)",
      icon: <Cpu className="w-8 h-8" />,
      asset: findAsset(assets, ["x64.dmg", "x86_64.dmg"]),
      fallbackUrl: `${RELEASES_URL}/latest`,
    },
    {
      label: "Linux",
      sublabel: "Debian / Ubuntu (.deb)",
      icon: <HardDrive className="w-8 h-8" />,
      asset: findAsset(assets, [".deb"]),
      fallbackUrl: `${RELEASES_URL}/latest`,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Download{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              DLM ADF
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            The desktop application for viewing and editing Agent Document
            Format files. Available for Windows, macOS, and Linux.
          </p>
          {!loading && release && (
            <p className="text-white/30 text-sm mt-3">
              Latest release: <span className="text-white/50 font-medium">{version}</span>
              {release.published_at && (
                <> &middot; {new Date(release.published_at).toLocaleDateString()}</>
              )}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            {platforms.map((platform, i) => {
              const url = platform.asset?.browser_download_url ?? platform.fallbackUrl;
              const size = platform.asset ? formatBytes(platform.asset.size) : null;

              return (
                <motion.a
                  key={i}
                  href={url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group flex items-center gap-5 p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
                >
                  <div className="text-white/30 group-hover:text-blue-400 transition-colors">
                    {platform.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg">{platform.label}</div>
                    <div className="text-sm text-white/40">{platform.sublabel}</div>
                    {platform.asset && (
                      <div className="text-xs text-white/25 mt-1 truncate">
                        {platform.asset.name}
                        {size && <> &middot; {size}</>}
                      </div>
                    )}
                  </div>
                  <Download className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition-colors shrink-0" />
                </motion.a>
              );
            })}
          </div>
        )}

        <div className="text-center space-y-4">
          <a
            href={release?.html_url ?? `${RELEASES_URL}/latest`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            View all releases on GitHub
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
