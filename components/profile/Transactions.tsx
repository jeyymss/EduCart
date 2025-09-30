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

type TxStatus = "active" | "completed" | "cancelled";
type TxType = "All" | "Purchases" | "Sales";

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
    let cancelled = false;
    setCount(0);

    return () => {
      cancelled = true;
    };
  }, [userId, status, type, search, adv]);

  return <>{count ?? 0}</>;
}

export default function Transactions({ userId }: { userId: string }) {
  const [statusTab, setStatusTab] = React.useState<TxStatus>("active");
  const [typeFilter, setTypeFilter] = React.useState<TxType>("All");
  const [search, setSearch] = React.useState<string>("");
  const [adv, setAdv] = React.useState<AdvancedFilterValue>({ ...EMPTY_ADV });

  const Header = (
    <div className="sticky top-0 z-20 bg-white border-b flex justify-between items-center gap-4 px-2 py-2">
      {/* Left: sub-tabs with counts */}
      <TabsList className="flex bg-transparent h-auto">
        <TabsTrigger value="active" className="tab-trigger">
          Active (
          <Count
            userId={userId}
            status="active"
            type={typeFilter}
            search={search}
            adv={adv}
          />
          )
        </TabsTrigger>

        <TabsTrigger value="completed" className="tab-trigger">
          Completed (
          <Count
            userId={userId}
            status="completed"
            type={typeFilter}
            search={search}
            adv={adv}
          />
          )
        </TabsTrigger>

        <TabsTrigger value="cancelled" className="tab-trigger">
          Cancelled (
          <Count
            userId={userId}
            status="cancelled"
            type={typeFilter}
            search={search}
            adv={adv}
          />
          )
        </TabsTrigger>
      </TabsList>

      {/* Type, Search, Advanced Filters */}
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

  const BlankBody = <div className="p-4" />; 

  return (
    <section className="border rounded-2xl bg-white shadow-sm w-full overflow-hidden">
      <Tabs
        value={statusTab}
        onValueChange={(v) => setStatusTab(v as TxStatus)}
        className="w-full"
      >
        {Header}
        <TabsContent value="active">{BlankBody}</TabsContent>
        <TabsContent value="completed">{BlankBody}</TabsContent>
        <TabsContent value="cancelled">{BlankBody}</TabsContent>
      </Tabs>
    </section>
  );
}