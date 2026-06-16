"use client";

import React from "react";
import { useWallet } from "../context/WalletContext";

export const WalletButton = () => {
  const { address, isConnected, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    await connect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition-colors"
    >
      Connect Wallet
    </button>
  );
};
