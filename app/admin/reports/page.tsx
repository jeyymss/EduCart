"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Inbox,
  Send,
  AlertTriangle,
  X,
  ShieldAlert,
  Ban,
  Eye,
  MoreVertical,
} from "lucide-react";

/* ===========================
   Types
=========================== */
type ReportBase = {
  id: string;
  type: "Product" | "Transaction" | "User";
  transactionId?: string;
  severity: "Minor" | "Major";
  details: string;
};

type RealReport = ReportBase & {
  placeholder?: false;
  entity: string; // e.g., "Taylor Swift Album (ID: ...)"
};

type PlaceholderReport = {
  id: string;
  placeholder: true;
};

type Report = RealReport | PlaceholderReport;

/* ===========================
   Seed data (2 real + placeholders)
=========================== */
const REPORTS: Report[] = [
  {
    id: "R-101",
    type: "Product",
    entity: "Taylor Swift Album (ID: P-TS-1989)",
    transactionId: "T-90001",
    severity: "Minor",
    details:
      "Buyer reports the received album is a different edition than described.",
  },
  {
    id: "R-102",
    type: "Product",
    entity: "Nike Shoes (ID: P-NK-1234)",
    transactionId: "T-90002",
    severity: "Major",
    details:
      "Seller allegedly altered brand tags; buyer suspects counterfeit merchandise.",
  },
  { id: "R-103", placeholder: true },
  { id: "R-104", placeholder: true },
  { id: "R-105", placeholder: true },
  { id: "R-106", placeholder: true },
];

export default function ReportPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | "Product" | "Transaction" | "User">(
    "All"
  );
  const [severity, setSeverity] = useState<"All" | "Minor" | "Major">("All");

  const [openDetails, setOpenDetails] = useState<RealReport | null>(null);
  const [composeFor, setComposeFor] = useState<RealReport | null>(null);

  const [menu, setMenu] = useState<{
    id: string | null;
    top: number;
    left: number;
  }>({ id: null, top: 0, left: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu((m) => ({ ...m, id: null }));
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#report-options-menu")) return; // click inside menu
      if (target.closest("[data-options-trigger]")) return; // click on trigger
      setMenu((m) => ({ ...m, id: null }));
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      if ("placeholder" in r && r.placeholder) {
        if (query.trim()) return false;
        if (type !== "All") return false;
        if (severity !== "All") return false;
        return true;
      }
      const rr = r as RealReport;
      const matchesType = type === "All" || rr.type === type;
      const matchesSeverity = severity === "All" || rr.severity === severity;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        rr.id.toLowerCase().includes(q) ||
        rr.entity.toLowerCase().includes(q) ||
        (rr.transactionId || "").toLowerCase().includes(q) ||
        (rr.details || "").toLowerCase().includes(q);
      return matchesType && matchesSeverity && matchesQuery;
    });
  }, [query, type, severity]);

  const handleWarn = (r: RealReport) => {
    setMenu((m) => ({ ...m, id: null }));
    const ok = window.confirm(`Warn account for report ${r.id}?`);
    if (ok) alert(`Warning issued ✅ (UI only)`);
  };

  const handleSuspend = (r: RealReport) => {
    setMenu((m) => ({ ...m, id: null }));
    const ok = window.confirm(`Suspend account for report ${r.id}?`);
    if (ok) alert(`Account suspended ✅ (UI only)`);
  };

  const handleSendToSAO = (r: RealReport) => {
    setMenu((m) => ({ ...m, id: null }));
    setComposeFor(r);
  };

  const openOptionsMenu = (
    r: RealReport,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spacing = 8;
    setMenu({
      id: r.id,
      top: rect.bottom + spacing + window.scrollY,
      left: rect.right - 176 + window.scrollX, 
    });
  };

  return (
    <div className="mx-auto max-w-[95%] p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reports */}
        <div className="lg:col-span-8 space-y-6">
          {/* Toolbar */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <h2 className="text-lg font-semibold">Reports</h2>
                <div className="flex flex-1 md:flex-none items-center gap-2">
                  {/* Type */}
                  <select
                    className="w-full md:w-[160px] rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="All">All Types</option>
                    <option value="Product">Product</option>
                    <option value="Transaction">Transaction</option>
                    <option value="User">User</option>
                  </select>

                  {/* Severity */}
                  <select
                    className="w-full md:w-[160px] rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                  >
                    <option value="All">All Severity</option>
                    <option value="Minor">Minor</option>
                    <option value="Major">Major</option>
                  </select>

                  {/* Search */}
                  <div className="relative w-full md:w-[260px]">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search reports, entities, or IDs..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm pr-10"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 text-xs">
                      ⌘K
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md rounded-2xl">
            <CardContent className="p-0">
              <div className="grid grid-cols-12 items-center px-6 py-3 text-xs md:text-sm font-semibold text-gray-700 bg-[#C7D9E5]">
                <div className="col-span-5">Report</div>
                <div className="col-span-2">Transaction</div>
                <div className="col-span-2">Severity</div>
                <div className="col-span-1">Details</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              <ul className="divide-y">
                {filtered.length === 0 && (
                  <li className="px-6 py-10 text-center text-sm text-gray-500 bg-white">
                    No reports match your filters.
                  </li>
                )}

                {filtered.map((r) => {
                  if ("placeholder" in r && r.placeholder) {
                    return (
                      <li
                        key={r.id}
                        className="grid grid-cols-12 items-center px-6 py-6 bg-white"
                      >
                        <div className="col-span-5" />
                        <div className="col-span-2" />
                        <div className="col-span-2" />
                        <div className="col-span-1" />
                        <div className="col-span-2" />
                      </li>
                    );
                  }

                  const rr = r as RealReport;
                  const isOpen = menu.id === rr.id;

                  return (
                    <li
                      key={rr.id}
                      className="grid grid-cols-12 items-center px-6 py-5 bg-white hover:bg-gray-50 transition"
                    >
                      {/* Report */}
                      <div className="col-span-5">
                        <div className="text-sm font-medium text-gray-900">
                          {rr.entity}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rr.type} • {rr.id}
                        </div>
                      </div>

                      {/* Transaction */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {rr.transactionId || "—"}
                        </div>
                      </div>

                      {/* Severity (Minor/Major) */}
                      <div className="col-span-2">
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full text-xs px-2 py-1 border",
                            rr.severity === "Major"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200",
                          ].join(" ")}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {rr.severity}
                        </span>
                      </div>

                      {/* Details: View button */}
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl px-3 py-1.5 text-sm"
                          onClick={() => setOpenDetails(rr)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>

                      {/* Action: Options trigger (menu is rendered at page root with fixed positioning) */}
                      <div className="col-span-2 flex items-center justify-end">
                        <Button
                          type="button"
                          data-options-trigger
                          variant="outline"
                          className="rounded-xl px-3 py-1.5 text-sm"
                          onClick={(e) => openOptionsMenu(rr, e)}
                        >
                          <MoreVertical className="h-4 w-4 mr-1" />
                          Options
                        </Button>

                        {/* Render fixed menu once for the currently open row */}
                        {isOpen && (
                          <div
                            id="report-options-menu"
                            className="fixed z-[1000] w-44 rounded-xl border border-gray-200 bg-white shadow-lg"
                            style={{ top: menu.top, left: menu.left }}
                          >
                            <button
                              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => handleWarn(rr)}
                            >
                              <ShieldAlert className="h-4 w-4 text-amber-600" />
                              Warn
                            </button>
                            <button
                              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => handleSuspend(rr)}
                            >
                              <Ban className="h-4 w-4 text-[#102E4A]" />
                              Suspend
                            </button>
                            <button
                              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => handleSendToSAO(rr)}
                            >
                              <Mail className="h-4 w-4 text-[#E59D2C]" />
                              Send to SAO
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Inbox / Compose */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {composeFor
                    ? "Compose to Student Affairs Office"
                    : "Inbox • Student Affairs Office"}
                </h3>
                {!composeFor ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-1">
                    <Inbox className="h-4 w-4" />
                    Placeholder
                  </span>
                ) : (
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setComposeFor(null)}
                    aria-label="Close composer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {!composeFor ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-dashed border-gray-200 p-4">
                    <p className="text-sm text-gray-600">
                      Replies from the Student Affairs Office will appear here.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This is a read-only placeholder for now.
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="h-3.5 w-4/5 rounded bg-black/10" />
                      <div className="h-3.5 w-2/3 rounded bg-black/10" />
                      <div className="h-3.5 w-3/5 rounded bg-black/10" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Need to escalate a report?
                    </span>
                    <Button
                      variant="outline"
                      className="rounded-xl px-3 py-1.5 text-sm"
                      onClick={() => {
                        const firstReal = REPORTS.find(
                          (r) => !("placeholder" in r)
                        ) as RealReport | undefined;
                        if (firstReal) setComposeFor(firstReal);
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      New message
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setComposeFor(null);
                    alert("Pretend sent to SAO ✅ (frontend only)");
                  }}
                >
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">To</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      defaultValue="sao@university.edu.ph"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Subject</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      defaultValue={`Report ${composeFor?.id} • ${composeFor?.type} • ${composeFor?.severity}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Message</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      defaultValue={`Hello Student Affairs Office,

We are escalating the following report:

• Report ID: ${composeFor?.id}
• Type: ${composeFor?.type}
• Entity: ${(composeFor as RealReport)?.entity}
• Transaction: ${composeFor?.transactionId || "—"}
• Severity: ${composeFor?.severity}

Details:
${composeFor?.details}

Please advise on next steps.

Thank you,
EduCart Admin`}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setComposeFor(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl bg-[#102E4A] text-white hover:opacity-90"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {openDetails && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpenDetails(null)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="space-y-0.5">
                <div className="text-sm text-gray-500">{openDetails.type}</div>
                <h3 className="text-lg font-semibold">{openDetails.entity}</h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setOpenDetails(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Report ID</div>
                  <div className="font-medium">{openDetails.id}</div>
                </div>
                <div>
                  <div className="text-gray-500">Severity</div>
                  <div className="font-medium">{openDetails.severity}</div>
                </div>
                <div>
                  <div className="text-gray-500">Transaction</div>
                  <div className="font-medium">
                    {openDetails.transactionId || "—"}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-gray-500 text-sm mb-1">Details</div>
                <p className="text-sm leading-6">{openDetails.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}