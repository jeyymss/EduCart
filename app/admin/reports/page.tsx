"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  ShieldAlert,
  Ban,
  Mail,
  ChevronDown,
} from "lucide-react";

/* ===================== TYPES ===================== */
type UserRef = {
  name: string;
  email: string;
};

type Report = {
  id: string;
  title: string;
  type: "Product" | "Transaction" | "User";
  status: "Pending" | "Resolved";
  details: string;
  reportedBy: UserRef;
  target: {
    label: string;
    value: string;
    owner?: UserRef;
  };
};

/* ===================== DATA ===================== */
const REPORTS: Report[] = [
  {
    id: "R-101",
    title: "Taylor Swift Album",
    type: "Product",
    status: "Pending",
    details: "The item I received is defective and the seller is unresponsive.",
    reportedBy: {
      name: "Vivianne Alano",
      email: "vfalano@gbox.adnu.edu.ph",
    },
    target: {
      label: "Product ID",
      value: "P-TS-1989",
      owner: {
        name: "James Aguilar",
        email: "jaguilar@gbox.adnu.edu.ph",
      },
    },
  },
  {
    id: "R-305",
    title: "Nike Shoes",
    type: "Transaction",
    status: "Resolved",
    details: "The product delivered does not match the description.",
    reportedBy: {
      name: "Juan Cruz",
      email: "juandcruz@gmail.com",
    },
    target: {
      label: "Transaction ID",
      value: "T-90002",
      owner: {
        name: "Maria Clara Santos",
        email: "mclarasantos@gmail.com",
      },
    },
  },
  {
    id: "R-412",
    title: "Andres Felipe",
    type: "User",
    status: "Pending",
    details: "User has been sending inappropriate messages.",
    reportedBy: {
      name: "Fred Lacson",
      email: "flacson@gmail.com",
    },
    target: {
      label: "User Email",
      value: "anflpe@gmail.com",
    },
  },
];

/* ===================== PAGE ===================== */
export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | Report["type"]>("All");
  const [openDetails, setOpenDetails] = useState<Report | null>(null);
  const [animate, setAnimate] = useState(false);

  /* animation sync */
  useEffect(() => {
    if (openDetails) requestAnimationFrame(() => setAnimate(true));
    else setAnimate(false);
  }, [openDetails]);

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      const matchesType = type === "All" || r.type === type;
      const matchesQuery =
        !query ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.id.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [query, type]);

  const pendingCount = REPORTS.filter((r) => r.status === "Pending").length;
  const resolvedCount = REPORTS.filter((r) => r.status === "Resolved").length;

  return (
    <div className="mx-auto max-w-[95%] space-y-6 p-6">

      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-xl border border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700">Pending Reports</p>
            <p className="text-2xl font-bold text-amber-800">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Resolved Reports</p>
            <p className="text-2xl font-bold text-green-800">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== FILTERS ===== */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <h2 className="text-lg font-semibold">Reports</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="appearance-none rounded-xl border px-4 py-2 pr-9 text-sm"
              >
                <option value="All">All Types</option>
                <option value="Product">Product</option>
                <option value="Transaction">Transaction</option>
                <option value="User">User</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            <input
              placeholder="Search reports"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-xl border px-4 py-2 text-sm w-[260px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== TABLE ===== */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold bg-[#C7D9E5]">
            <div className="col-span-4">Report</div>
            <div className="col-span-2">Report ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Details</div>
          </div>

          {filtered.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 px-6 py-4 border-b hover:bg-gray-50"
            >
              <div className="col-span-4 font-medium">{r.title}</div>
              <div className="col-span-2 text-gray-600">{r.id}</div>
              <div className="col-span-2">{r.type}</div>
              <div className="col-span-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    r.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenDetails(r)}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ===== DETAILS DRAWER ===== */}
      {openDetails && (
        <div className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              animate ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpenDetails(null)}
          />

          <div
            className={`absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transform transition-all duration-300 ease-out
              ${animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold">{openDetails.title}</h3>
                <p className="text-xs text-gray-500">
                  Report ID: {openDetails.id}
                </p>
              </div>
              <button onClick={() => setOpenDetails(null)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <Card>
                <CardContent className="p-4 space-y-1">
                  <div>
                    <strong>{openDetails.target.label}:</strong>{" "}
                    {openDetails.target.value}
                  </div>

                  {openDetails.target.owner && (
                    <>
                      <div>
                        <strong>Seller:</strong>{" "}
                        {openDetails.target.owner.name}
                      </div>
                      <div className="text-xs">
                        {openDetails.target.owner.email}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-500">Reported by</div>
                  <div className="font-medium">
                    {openDetails.reportedBy.name}
                  </div>
                  <div className="text-xs">
                    {openDetails.reportedBy.email}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">{openDetails.details}</CardContent>
              </Card>
            </div>

            <div className="border-t p-4 flex gap-2">
              <Button variant="outline">
                <ShieldAlert className="h-4 w-4 mr-1" /> Warn
              </Button>
              <Button variant="outline">
                <Ban className="h-4 w-4 mr-1" /> Suspend
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-1" /> Email OSA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
