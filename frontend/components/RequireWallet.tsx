"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";

export default function RequireWallet({
  children,
  redirectTo = "/",
  loadingFallback,
}: {
  children: ReactNode;
  redirectTo?: string;
  loadingFallback?: ReactNode;
}) {
  const router = useRouter();
  const { isConnected, connectionStatus } = useWallet();

  const isChecking = useMemo(
    () => connectionStatus === "loading",
    [connectionStatus],
  );

  useEffect(() => {
    if (!isConnected && !isChecking) {
      router.replace(redirectTo);
    }
  }, [isConnected, isChecking, redirectTo, router]);

  if (!isConnected) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-12 px-4">
        {loadingFallback ?? (
          <div className="w-full max-w-md rounded-2xl bg-white/5 border border-zinc-800 p-6 text-center">
            <div className="text-lg font-mono font-semibold text-zinc-200">
              Wallet connection required
            </div>
            <div className="mt-2 text-sm text-zinc-400 font-mono">
              Connect your Freighter wallet to access this page.
            </div>
            {isChecking && (
              <div className="mt-4 text-sm text-zinc-400 font-mono">
                Checking wallet connection…
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
