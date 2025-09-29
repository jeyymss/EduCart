"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

export default function OrgWallet() {
  return (
    <div className="mx-auto max-w-[95%] space-y-8 p-6">
      {/* Top balance banner */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-white">
          <div className="space-y-2 flex-1">
            <p className="text-lg font-semibold text-[#E59D2C]">
              Current Wallet Balance
            </p>
            {/* placeholder balance */}
            <div className="h-12 w-full max-w-sm rounded-md bg-black/10" />
          </div>

          <Button
            className="rounded-xl px-6 py-6 md:py-3 bg-white text-[#E59D2C] border border-[#E59D2C] hover:bg-gray-50 shadow-sm"
          >
            Change GCash Account
          </Button>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="px-8 pt-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              All Transaction Details
            </h3>
          </div>

          {/* header row */}
          <div className="grid grid-cols-12 items-center px-8 py-3 text-sm font-semibold text-gray-700 bg-[#C7D9E5]">
            <div className="col-span-3">User name</div>
            <div className="col-span-5">Product</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* body – 10 placeholder rows */}
          <ul className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <li
                key={i}
                className="grid grid-cols-12 items-center px-8 py-5 bg-white hover:bg-gray-50 transition"
              >
                {/* user name placeholder */}
                <div className="col-span-3">
                  <div className="h-5 w-full max-w-[200px] rounded bg-black/10" />
                </div>

                {/* product placeholder */}
                <div className="col-span-5">
                  <div className="h-5 w-full max-w-[300px] rounded bg-black/10" />
                </div>

                {/* price placeholder */}
                <div className="col-span-2 flex justify-end">
                  <div className="h-5 w-full max-w-[100px] rounded bg-black/10" />
                </div>

                {/* status placeholder */}
                <div className="col-span-2 flex justify-end">
                  <div className="h-6 w-full max-w-[120px] rounded-full bg-black/10" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}