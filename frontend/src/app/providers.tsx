"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { getMe, logoutUser } from "@/lib/auth";
import { useAppStore } from "@/lib/store";

function AuthLoader({ children }: { children: ReactNode }) {
  const { setUser, setToken } = useAppStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getMe().then(async (user) => {
      if (user) {
        setUser(user);
        if (user.token) setToken(user.token);
      } else {
        await logoutUser().catch(() => {});
      }
      setChecked(true);
    });
  }, [setUser, setToken]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthLoader>{children}</AuthLoader>
    </QueryClientProvider>
  );
}
