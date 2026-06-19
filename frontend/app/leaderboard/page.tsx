import Leaderboard from "@/components/Leaderboard";
import RequireWallet from "@/components/RequireWallet";

export default function LeaderboardPage() {
  return (
    <RequireWallet>
      <div className="flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold font-mono mb-1">Leaderboard</h1>
          <p className="text-sm text-[#94a3b8] font-mono mb-6">
            Top token snatchers this season
          </p>

          <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
            <Leaderboard />
          </div>

          <p className="text-xs text-[#64748b] font-mono mt-4 text-center">
            Connect your wallet and play ranked mode to appear on the
            leaderboard.
          </p>
        </div>
      </div>
    </RequireWallet>
  );
}
