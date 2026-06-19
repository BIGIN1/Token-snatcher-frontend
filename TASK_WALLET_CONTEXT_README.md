# WalletContext Provider (React + TypeScript)

## What this task adds

A React Context Provider that manages wallet state globally across the application.

## Location

- Context + provider: `frontend/context/WalletContext.tsx`
- Global wiring: `frontend/app/layout.tsx` (wraps the app with `<WalletProvider>`)

## Responsibilities

The provider exposes the following wallet state and actions:

### Wallet State (globally available)

- `address: string | null`
- `isConnected: boolean`
- `connectionStatus: "loading" | "connected" | "disconnected"`
- `isLoading: boolean`
- `error: string | null`

### Wallet Actions

- `connect(): Promise<void>`
- `disconnect(): void`

### Persistence / Restoration

- On mount, the provider restores a cached wallet address using `WalletService.getCachedAddress()`.
- On successful connect, it caches the address via `WalletService.cacheAddress(pubKey)`.
- On disconnect, it clears the cache via `WalletService.disconnectWallet()`.

## Usage

Any component can access wallet data and actions by using:

- `import { useWallet } from "../context/WalletContext";`

Example:

```tsx
const { address, isConnected, connect, disconnect, error, isLoading } =
  useWallet();
```

## Acceptance Criteria Coverage

- ✅ Create `WalletContext`
- ✅ Provide wallet information globally
- ✅ Provide connect/disconnect methods
- ✅ Support loading and error states
- ✅ Include TypeScript typings
- ✅ Labeled under “frontend architecture wallet” (as context/hook under `frontend/context`)

## Notes

This repository already contained an implementation of `frontend/context/WalletContext.tsx` and it was already integrated into the app layout. No code changes were made under the provided constraints.
