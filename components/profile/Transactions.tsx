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
import TransactionCard from "@/components/transaction/Transaction Card/TransactionCard";
import type { TxMethod, TxSide } from "@/components/transaction/Transaction Card/TransactionCard";

type TxStatus = "active" | "completed" | "cancelled";
type TxType = "All" | "Purchases" | "Sales";

type Tx = {
  id: string;
  status: TxStatus;
  type: TxSide;             // "Purchases" | "Sales"
  method: TxMethod;         // "Meetup" | "Delivery"
  title: string;
  price: number;
  total?: number;
  created_at: string;
};

const EMPTY_ADV: AdvancedFilterValue = {
  time: null,
  price: null,
  posts: [],
  category: undefined,
  minPrice: null,
  maxPrice: null,
};

function Count({
  userId,
  status,
  type,
  search,
  adv,
}: {
  userId: string;
  status?: TxStatus;
  type: TxType;
  search: string;
  adv: AdvancedFilterValue;
}) {
  const [count, setCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    setCount(0); // placeholder
  }, [userId, status, type, search, adv]);
  return <>{count ?? 0}</>;
}

export default function Transactions({ userId }: { userId: string }) {
  const [statusTab, setStatusTab] = React.useState<TxStatus>("active");
  const [typeFilter, setTypeFilter] = React.useState<TxType>("All");
  const [search, setSearch] = React.useState<string>("");
  const [adv, setAdv] = React.useState<AdvancedFilterValue>({ ...EMPTY_ADV });

  // 🔹 Four placeholders to demo every case
  const txs: Tx[] = [
    // Sales + Delivery → Add Delivery
    {
      id: "tx_sales_delivery",
      status: "active",
      type: "Sales",
      method: "Delivery",
      title: "Apple AirPods 3",
      price: 5000,
      total: 5080,
      created_at: new Date().toISOString(),
    },
    // Sales + Meetup → Delivered
    {
      id: "tx_sales_meetup",
      status: "active",
      type: "Sales",
      method: "Meetup",
      title: "iPad Mini 6",
      price: 18000,
      total: 18000,
      created_at: new Date().toISOString(),
    },
    // Purchases + Delivery → Received
    {
      id: "tx_purchases_delivery",
      status: "active",
      type: "Purchases",
      method: "Delivery",
      title: "Mechanical Keyboard",
      price: 3200,
      total: 3400,
      created_at: new Date().toISOString(),
    },
    // Purchases + Meetup → Received
    {
      id: "tx_purchases_meetup",
      status: "active",
      type: "Purchases",
      method: "Meetup",
      title: "Secondhand Monitor",
      price: 2500,
      total: 2500,
      created_at: new Date().toISOString(),
    },
  ];

  const filtered = React.useMemo(() => {
    return txs
      .filter((t) => t.status === statusTab)
      .filter((t) => (typeFilter === "All" ? true : t.type === typeFilter))
      .filter((t) =>
        search.trim()
          ? t.title.toLowerCase().includes(search.toLowerCase())
          : true
      );
  }, [txs, statusTab, typeFilter, search]);

  const Header = (
    <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
      <TabsList className="flex bg-transparent h-auto">
        <TabsTrigger value="active" className="tab-trigger">
          Active (
          <Count userId={userId} status="active" type={typeFilter} search={search} adv={adv} />
          )
        </TabsTrigger>
        <TabsTrigger value="completed" className="tab-trigger">
          Completed (
          <Count userId={userId} status="completed" type={typeFilter} search={search} adv={adv} />
          )
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="tab-trigger">
          Cancelled (
          <Count userId={userId} status="cancelled" type={typeFilter} search={search} adv={adv} />
          )
        </TabsTrigger>
      </TabsList>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50">
            {typeFilter === "All" ? "Type" : typeFilter}
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["All", "Purchases", "Sales"] as TxType[]).map((label) => (
              <DropdownMenuItem key={label} onClick={() => setTypeFilter(label)}>
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
          onApply={(next) => setAdv({ ...next, posts: [...(next.posts ?? [])] })}
        />
      </div>
    </div>
  );

  const ListBody = (
    <div className="p-4">
      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No transactions yet.</div>
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
                image={"/bluecart.png"}
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