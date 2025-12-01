"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "inbound" | "outbound";
  status: "completed" | "pending" | "failed";
  timestamp: string;
  category: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Payment from EduCart",
    amount: 540,
    type: "inbound",
    status: "completed",
    timestamp: "2025-11-23 14:32",
    category: "Deposit",
  },
  {
    id: "2",
    description: "Escrow hold - Order #5421",
    amount: 250,
    type: "outbound",
    status: "pending",
    timestamp: "2025-11-22 09:15",
    category: "Escrow",
  },
];

function getStatusBadge(status: Transaction["status"]) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="border-green-500/30 text-green-600 bg-green-500/10 flex items-center gap-1 w-fit"
        >
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-orange-500/30 text-orange-600 bg-orange-500/10 flex items-center gap-1 w-fit"
        >
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="border-red-500/30 text-red-600 bg-red-500/10 flex items-center gap-1 w-fit"
        >
          <XCircle className="w-3 h-3" />
          Failed
        </Badge>
      );
  }
}

function getAmountDisplay(amount: number, type: Transaction["type"]) {
  const sign = type === "inbound" ? "+" : "-";
  const color = type === "inbound" ? "text-green-500" : "text-foreground";

  return (
    <span className={`font-semibold ${color}`}>
      {sign}₱{amount.toFixed(2)}
    </span>
  );
}

export function WalletHistory() {
  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Your recent wallet transactions and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((t) => (
                <TableRow key={t.id} className="border-border/50 hover:bg-accent/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          t.type === "inbound"
                            ? "bg-green-500/10"
                            : "bg-gray-500/10"
                        }`}
                      >
                        {t.type === "inbound" ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <p className="font-medium">{t.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {t.category}
                  </TableCell>
                  <TableCell>{getAmountDisplay(t.amount, t.type)}</TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
