"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, FileX, Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="mx-auto max-w-[95%] space-y-8 p-6">
      {/* Top balance banner */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-white">
          <div className="space-y-2 flex-1">
            <p className="text-lg font-semibold text-[#E59D2C]">
              Current Wallet Balance
            </p>
            {/* balance placeholder */}
            <div className="h-12 w-full max-w-sm rounded-md bg-black/10" />
            <p className="text-xs text-muted-foreground">
              Updated in real time once transactions post.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl px-6 py-6 md:py-3 border border-[#E59D2C] text-[#E59D2C] hover:bg-gray-50 shadow-sm"
            >
              Change GCash Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Invoices Paid */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Invoices Paid</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-xs px-2 py-1">
                <FileCheck className="h-4 w-4" />
                Cleared
              </span>
            </div>
            <div className="mt-3 h-8 w-48 rounded-md bg-black/10" />
          </CardContent>
        </Card>

        {/* Invoices Unpaid */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Invoices Unpaid</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 text-xs px-2 py-1">
                <FileX className="h-4 w-4" />
                Outstanding
              </span>
            </div>
            <div className="mt-3 h-8 w-48 rounded-md bg-black/10" />
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Earnings</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-xs px-2 py-1">
                <Wallet className="h-4 w-4" />
                Your share
              </span>
            </div>
            <div className="mt-3 h-8 w-32 rounded-md bg-black/10" />
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* header */}
          <div className="px-8 pt-6 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              All Transaction Details
            </h3>

            {/* Filters (UI only) */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-gray-500">
                Showing recent activity
              </div>
              <Button variant="outline" className="rounded-xl">
                Export CSV
              </Button>
            </div>
          </div>

          {/* column labels */}
          <div className="grid grid-cols-12 items-center px-8 py-3 text-xs md:text-sm font-semibold text-gray-700 bg-[#C7D9E5]">
            <div className="col-span-4 md:col-span-3">User name</div>
            <div className="col-span-6 md:col-span-5">Product</div>
            <div className="col-span-2 md:col-span-2 text-right">Price</div>
            <div className="col-span-12 md:col-span-2 md:text-right">Status</div>
          </div>

          {/* body – placeholder rows */}
          <ul className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <li
                key={i}
                className="grid grid-cols-12 items-center px-8 py-5 bg-white hover:bg-gray-50 transition"
              >
                <div className="col-span-4 md:col-span-3">
                  <div className="h-5 w-full max-w-[200px] rounded bg-black/10" />
                </div>
                <div className="col-span-6 md:col-span-5">
                  <div className="h-5 w-full max-w-[320px] rounded bg-black/10" />
                </div>
                <div className="col-span-2 md:col-span-2 flex justify-end">
                  <div className="h-5 w-full max-w-[100px] rounded bg-black/10" />
                </div>
                <div className="col-span-12 md:col-span-2 md:flex md:justify-end mt-3 md:mt-0">
                  <div className="h-6 w-full max-w-[120px] rounded-full bg-black/10" />
                </div>
              </li>
            ))}
          </ul>

          {/* footer note */}
          <div className="px-8 py-4 text-xs text-gray-500 bg-white">
          </div>
        </CardContent>
      </Card>
    </div>
  );
}