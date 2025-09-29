"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReviewsPage() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const years = Array.from({ length: 8 }, (_, i) => `${new Date().getFullYear() - i}`);

  const [month, setMonth] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const [sort, setSort] = React.useState<string>("");

  return (
    <div className="mx-auto max-w-[95%] space-y-6 p-6">
      {/* Page header + controls */}
      <Card className="border-none shadow-md rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4]">
          <h1 className="text-lg font-semibold text-gray-900">Reviews</h1>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month */}
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year */}
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-28 bg-white">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 bg-white">
                <SelectValue placeholder="Newest to Oldest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest to Oldest</SelectItem>
                <SelectItem value="old">Oldest to Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews list */}
      <Card className="rounded-2xl border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-[#C7D9E5]">
            <div className="col-span-4">Users</div>
            <div className="col-span-6">Review</div>
            <div className="col-span-2 text-right">Posted date</div>
          </div>

          {/* Rows (placeholders only) */}
          <ul className="divide-y">
            {Array.from({ length: 10 }).map((_, i) => (
              <li
                key={i}
                className="grid grid-cols-12 gap-2 px-6 py-5 bg-white hover:bg-gray-50 transition"
              >
                {/* Users */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-28 rounded bg-gray-100" />
                  </div>
                </div>

                {/* Review */}
                <div className="col-span-6">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-5/6 rounded bg-gray-100" />
                    <div className="h-4 w-2/3 rounded bg-gray-100" />
                  </div>
                </div>

                {/* Posted date */}
                <div className="col-span-2 flex items-center justify-end">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}