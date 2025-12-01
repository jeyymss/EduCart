"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Lock } from "lucide-react";

export function WalletBalances({
  balance,
  escrow,
  loading,
}: {
  balance: number | null;
  escrow: number | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Current Balance */}
      <Card className="border border-border/50 bg-linear-to-br from-card to-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Balance</CardTitle>
              <CardDescription>Available funds</CardDescription>
            </div>
            <div className="p-2 bg-gray-200 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xl animate-pulse">Loading...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-4xl font-bold text-foreground">
                ₱{balance?.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Available for immediate use
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Escrow */}
      <Card className="border border-border/50 bg-linear-to-br from-card to-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pending Escrow</CardTitle>
              <CardDescription>Held in escrow</CardDescription>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Lock className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xl animate-pulse">Loading...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-4xl font-bold text-foreground">
                ₱{escrow?.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                On hold for ongoing transactions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
