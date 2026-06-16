import {
  isConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";

export class WalletService {
  /**
   * Checks if Freighter is installed and connected
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const connected = await isConnected();
      return !!connected?.isConnected;
    } catch (error) {
      console.error("Error checking Freighter connection:", error);
      return false;
    }
  }

  /**
   * Requests access to the user's Freighter wallet
   * @returns The user's public key (Stellar address) if successful, or null
   */
  static async connectWallet(): Promise<string | null> {
    try {
      const isInstalled = await this.checkConnection();
      if (!isInstalled) {
        alert("Please install the Freighter wallet extension to connect.");
        return null;
      }

      // requestAccess returns the public key if the user grants access
      const accessResponse = await requestAccess();
      
      // requestAccess sometimes returns an error if rejected
      if (typeof accessResponse === "object" && accessResponse !== null && 'error' in accessResponse) {
         console.error("Freighter access error:", accessResponse.error);
         return null;
      }
      
      const pubKey = await getAddress();
      return typeof pubKey === "string" ? pubKey : pubKey?.address || null;

    } catch (error) {
      console.error("Error connecting to Freighter:", error);
      return null;
    }
  }

  /**
   * Disconnect the wallet
   * Freighter doesn't have a direct disconnect API that revokes permissions.
   * Disconnection logic must be handled by the application state (e.g. clearing context).
   */
  static disconnectWallet(): void {
    // Optionally clear any local storage items if you are caching the connection
    localStorage.removeItem("freighter_connected_address");
  }

  /**
   * Gets the cached address from local storage if available
   */
  static getCachedAddress(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("freighter_connected_address");
    }
    return null;
  }

  /**
   * Saves the address to local storage for persistence
   */
  static cacheAddress(address: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("freighter_connected_address", address);
    }
  }
}
