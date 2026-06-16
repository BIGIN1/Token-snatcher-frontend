"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WalletService } from "../services/wallet.service";

interface WalletContextProps {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on mount to see if user was previously connected
    const cachedAddress = WalletService.getCachedAddress();
    if (cachedAddress) {
      setAddress(cachedAddress);
    }
  }, []);

  const connect = async () => {
    const pubKey = await WalletService.connectWallet();
    if (pubKey) {
      setAddress(pubKey);
      WalletService.cacheAddress(pubKey);
    }
  };

  const disconnect = () => {
    setAddress(null);
    WalletService.disconnectWallet();
  };

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
