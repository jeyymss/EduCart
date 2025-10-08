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

  const Header = (
    <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
      <TabsList className="flex bg-transparent h-auto">
        {(["active", "completed", "cancelled"] as TxStatus[]).map((tab) => (
          <TabsTrigger key={tab} value={tab} className="tab-trigger capitalize">
            {tab} ({transactions.filter((t) => t.status === tab).length})
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex items-center gap-3">
        {/* Dropdown: All, Sales, Purchases */}
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
          className="h-9 w-[200px] text-sm"
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

  const ListBody = (
    <div className="p-4">
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading transactions...</div>
      ) : isError ? (
        <div className="text-sm text-red-500">Error loading transactions</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No transactions found.</div>
      ) : (
        <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-3">
          {filtered.map((tx) => (
            <div key={tx.id} className="h-full">
              <TransactionCard
                id={tx.id}
                type={tx.type}
                method={tx.method}
                title={tx.title}
                price={tx.price}
                total={tx.total}
                status={tx.status}
                postType={tx.post_type}
                image={tx.image_url}
                onView={(id) => console.log("view", id)}
                onPrimary={(id) => console.log("primary action", id)}
              />
            </div>
          ))}
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
        <TabsContent value="active">{ListBody}</TabsContent>
        <TabsContent value="completed">{ListBody}</TabsContent>
        <TabsContent value="cancelled">{ListBody}</TabsContent>
      </Tabs>
    </section>
  );
}
