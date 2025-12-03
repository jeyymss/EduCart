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

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useState } from "react";

/* ------------------ CUSTOM MODAL (NO DIALOG, NO SHEET) ------------------ */

function TransactionModal({
  open,
  onClose,
  tx,
}: {
  open: boolean;
  onClose: () => void;
  tx: any | null;
}) {
  if (!open || !tx) return null;

  // only show reference code if type is CashIn
  const isCashIn = tx.type?.toLowerCase() === "cashin";

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            <span>{tx.description}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Category:</span>
            <span>{tx.type}</span>
          </div>

          {/* ⭐ ONLY SHOW FOR CASH IN */}
          {isCashIn && tx.reference_code && (
            <div className="flex justify-between">
              <span className="font-medium">Reference Code:</span>
              <span className="font-semibold">{tx.reference_code}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span>
              ₱{Number(tx.amount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span>{tx.status}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>
              {new Date(tx.created_at).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        <button
          className="mt-6 w-full py-2 rounded-md bg-gray-900 dark:bg-white dark:text-black text-white hover:bg-gray-700 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}



/* ------------------ MAIN COMPONENT ------------------ */

export function WalletHistory({ transactions }: { transactions: any[] }) {
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = transactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatAmount = (amount: number) =>
    "₱" + Number(amount).toFixed(2);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
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
      default:
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
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* Modal state */
  const [openModal, setOpenModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const openTransaction = (tx: any) => {
    setSelectedTx(tx);
    setOpenModal(true);
  };

  return (
    <>
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
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
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No transactions yet
                    </TableCell>
                  </TableRow>
                )}

                {currentItems.map((t) => (
                  <TableRow
                    key={t.id}
                    onClick={() => openTransaction(t)}
                    className="border-border/50 hover:bg-accent/5 cursor-pointer transition"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            t.amount > 0
                              ? "bg-green-500/10"
                              : "bg-gray-500/10"
                          }`}
                        >
                          {t.amount > 0 ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <p className="font-medium">{t.description}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {t.type}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`font-semibold ${
                          t.amount > 0 ? "text-green-500" : "text-foreground"
                        }`}
                      >
                        {t.amount > 0 ? "+" : "-"}
                        {formatAmount(Math.abs(t.amount))}
                      </span>
                    </TableCell>

                    <TableCell>{getStatusBadge(t.status)}</TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(t.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ⭐ PAGINATION */}
          {transactions.length > 0 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent className="flex gap-4">

                  <PaginationItem>
                    <PaginationPrevious
                      className={`${
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }`}
                      onClick={() => page > 1 && setPage(page - 1)}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const p = index + 1;
                    return (
                      <PaginationItem
                        key={p}
                        className={`px-3 py-1 rounded-md cursor-pointer ${
                          page === p
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      className={`${
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }`}
                      onClick={() => page < totalPages && setPage(page + 1)}
                    />
                  </PaginationItem>

                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ⭐ CUSTOM MODAL HERE */}
      <TransactionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        tx={selectedTx}
      />
    </>
  );
}
