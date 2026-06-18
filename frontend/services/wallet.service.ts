import {
  isConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";

export class WalletService {
  private static readonly STORAGE_KEY = "freighter_connected_address";

  /**
   * Checks if Freighter wallet is installed
   */
  static async isFreighterInstalled(): Promise<boolean> {
    try {
      return await isConnected().then(result => !!result?.isConnected);
    } catch {
      return false;
    }
  }

  /**
   * Requests access to the user's Freighter wallet
   * @returns The user's public key (Stellar address) if successful, or null
   * @throws Error with user-friendly message if connection fails
   */
  static async connectWallet(): Promise<string | null> {
    try {
      const installed = await this.isFreighterInstalled();
      if (!installed) {
        throw new Error("Freighter wallet is not installed. Please install it to continue.");
      }

      await requestAccess();
      const address = await getAddress();

      if (!address || typeof address !== "string") {
        throw new Error("Failed to retrieve wallet address.");
      }

      return address;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect wallet";
      console.error("Wallet connection error:", message);
      throw error;
    }
  }

  /**
   * Disconnects the wallet by clearing local storage
   */
  static disconnectWallet(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Gets the cached wallet address from local storage
   */
  static getCachedAddress(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  /**
   * Caches the wallet address to local storage
   */
  static cacheAddress(address: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, address);
    }
  }
}
