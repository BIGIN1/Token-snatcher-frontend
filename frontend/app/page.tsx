"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { WalletButton } from "../components/WalletButton";
import { useWallet } from "../context/WalletContext";

const formatAddress = (addr: string) => {
  return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
};

export default function Home() {
  const { isConnected, address, connect, isLoading } = useWallet();
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black p-8">
      <header className="w-full max-w-4xl flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <span className="font-bold text-xl ml-4">Token Snatcher</span>
        </div>
        <WalletButton />
      </header>

      <main className="flex w-full max-w-4xl flex-col items-center justify-center flex-1 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 mb-6">
          Ready to Snatch Tokens?
        </h1>
        
        {isConnected ? (
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4 text-green-600 dark:text-green-400">
                Wallet Connected!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                You are ready to perform blockchain actions and start playing the game.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/ranked')}
                  className="px-8 py-3 w-full bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Start Ranked Game
                </button>
                <button
                  onClick={() => router.push('/free')}
                  className="px-8 py-3 w-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Free Play
                </button>
              </div>
            </div>
            {address && (
              <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-1">Connected Address</p>
                <p className="text-lg font-mono text-zinc-800 dark:text-zinc-200 cursor-pointer" title={address}>
                  {formatAddress(address)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-amber-600 dark:text-amber-500">
              Connection Required
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Connect your Freighter wallet to start playing.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={connect}
                disabled={isLoading}
                className="px-8 py-3 w-full bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
              <button
                onClick={() => router.push('/free')}
                className="px-8 py-3 w-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Try Free Play
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
