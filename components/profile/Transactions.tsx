"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdvancedFilters } from "@/components/profile/AdvancedFilters";
import type { AdvancedFilterValue } from "@/components/profile/AdvancedFilters";
import TransactionCard from "@/components/transaction/TransactionCard/TransactionCard";
import { useTransactions, Tx } from "@/hooks/queries/useTransactions";
import TransactionDetailsModal from "@/components/transaction/TransactionCard/TransactionDetailsModal";

type TxStatus = "active" | "completed" | "cancelled";
type TxType = "All" | "Sales" | "Purchases";

const EMPTY_ADV: AdvancedFilterValue = {
  time: null,
  price: null,
  posts: [],
  category: undefined,
  minPrice: null,
  maxPrice: null,
};

export default function Transactions({ userId }: { userId: string }) {
  const [statusTab, setStatusTab] = React.useState<TxStatus>("active");
  const [typeFilter, setTypeFilter] = React.useState<TxType>("All");
  const [search, setSearch] = React.useState<string>("");
  const [adv, setAdv] = React.useState<AdvancedFilterValue>({ ...EMPTY_ADV });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTx, setSelectedTx] = React.useState<Tx | null>(null);

  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useTransactions(userId);

  const filtered = React.useMemo(() => {
    return transactions
      .filter((t) => t.status === statusTab)
      .filter((t) => (typeFilter === "All" ? true : t.type === typeFilter))
      .filter((t) =>
        search.trim()
          ? t.title.toLowerCase().includes(search.toLowerCase())
          : true
      );
  }, [transactions, statusTab, typeFilter, search]);

  const handleView = React.useCallback(
    (id: string) => {
      const found = transactions.find((t) => t.id === id) ?? null;
      setSelectedTx(found);
      setIsModalOpen(Boolean(found));
    },
    [transactions]
  );

  const Header = (
    <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-4 py-3">
      <TabsList className="flex bg-transparent h-auto">
        {(["active", "completed", "cancelled"] as TxStatus[]).map((tab) => (
          <TabsTrigger key={tab} value={tab} className="tab-trigger capitalize">
            {tab} ({transactions.filter((t) => t.status === tab).length})
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
            {typeFilter}
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["All", "Sales", "Purchases"] as TxType[]).map((label) => (
              <DropdownMenuItem
                key={label}
                onClick={() => setTypeFilter(label)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="text"
          placeholder="Search transactions"
          className="h-9 w-[220px] text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <AdvancedFilters
          value={adv}
          onApply={(next) =>
            setAdv({ ...next, posts: [...(next.posts ?? [])] })
          }
        />
      </div>
    </div>
  );

  const TableBody = (
    <div className="p-4">
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading transactions...</div>
      ) : isError ? (
        <div className="text-sm text-red-500">Error loading transactions</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No transactions found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full table-fixed text-sm">
            {/* Even column spread */}
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
            </colgroup>

            <thead className="bg-gray-50 text-gray-700 text-[13px] uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Total Price</th>
                <th className="px-6 py-3 text-left">Listing Type</th>
                <th className="px-6 py-3 text-left">Transaction Type</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  id={tx.id}
                  transactionId={tx.transaction_id}
                  type={tx.type}
                  method={tx.method}
                  title={tx.title}
                  price={tx.price}
                  total={tx.total}
                  status={tx.status}
                  postType={tx.post_type}
                  image={tx.image_url}
                  onView={handleView}
                  onPrimary={(id) => console.log("primary action", id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <section className="border rounded-2xl bg-white shadow-sm w-full overflow-hidden">
      <Tabs
        value={statusTab}
        onValueChange={(v) => setStatusTab(v as TxStatus)}
        className="w-full"
      >
        {Header}
        <TabsContent value="active">{TableBody}</TabsContent>
        <TabsContent value="completed">{TableBody}</TabsContent>
        <TabsContent value="cancelled">{TableBody}</TabsContent>
      </Tabs>

      <TransactionDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={
          selectedTx
            ? {
                id: selectedTx.id,
                reference_code: selectedTx.reference_code,
                title: selectedTx.title,
                price: selectedTx.price,
                total: selectedTx.total ?? selectedTx.price,
                method: selectedTx.method,
                type: selectedTx.type,
                status: selectedTx.status,
                created_at: (selectedTx as any).created_at,
                buyer: (selectedTx as any).buyer_name,
                seller: (selectedTx as any).seller_name,
                address: (selectedTx as any).address,
              }
            : undefined
        }
      />
    </section>
  );
}
