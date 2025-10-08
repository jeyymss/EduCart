"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDisplayOrgItems } from "@/hooks/queries/displayOrgItem";

export function OrganizationPostsTable({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useDisplayOrgItems(userId);
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = React.useState<any | null>(null);
  const [filter, setFilter] = React.useState("All");

  // 🔧 Mutations
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/organization-account/userProduct/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success(`Post marked as ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["displayOrgItems", userId] });
    },
    onError: () => toast.error("Failed to update status."),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/organization-account/userProduct/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["displayOrgItems", userId] });
    },
    onError: () => toast.error("Failed to delete post."),
  });

  // Columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "item_title",
      header: "Item Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("item_title")}</div>
      ),
    },
    {
      accessorKey: "post_types.name",
      header: "Post Type",
      cell: ({ row }) => <div>{row.original.post_types?.name ?? "—"}</div>,
    },
    {
      accessorKey: "item_price",
      header: "Price",
      cell: ({ row }) => {
        const rawPrice = row.getValue("item_price");
        const price =
          typeof rawPrice === "number"
            ? rawPrice
            : rawPrice
            ? parseFloat(rawPrice as string)
            : null;
        return (
          <div className="text-right">
            {price ? `₱${price.toLocaleString()}` : "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const color =
          status === "Listed"
            ? "text-green-600"
            : status === "Sold"
            ? "text-yellow-600"
            : "text-gray-500";
        return <div className={`font-medium ${color}`}>{status}</div>;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const post = row.original;
        const loading = updateStatus.isPending || deletePost.isPending;

        // Dynamic options
        const actions = [];
        if (post.status !== "Listed")
          actions.push({
            label: "Mark as Listed",
            onClick: () =>
              updateStatus.mutate({ id: post.id, status: "Listed" }),
          });
        if (post.status !== "Sold")
          actions.push({
            label: "Mark as Sold",
            onClick: () => updateStatus.mutate({ id: post.id, status: "Sold" }),
          });
        if (post.status !== "Unlisted")
          actions.push({
            label: "Mark as Unlisted",
            onClick: () =>
              updateStatus.mutate({ id: post.id, status: "Unlisted" }),
          });

        const handleDelete = () => {
          if (!confirm("Are you sure you want to delete this post?")) return;
          deletePost.mutate(post.id);
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={loading}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {actions.map((a) => (
                <DropdownMenuItem
                  key={a.label}
                  onClick={a.onClick}
                  disabled={loading}
                >
                  {a.label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 focus:text-red-600"
              >
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredData =
    filter === "All"
      ? data ?? []
      : data?.filter((p: any) => p.status === filter) ?? [];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <p>Loading organization posts...</p>;
  if (isError) return <p>Failed to load posts.</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Organization Posts</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Filter:</label>
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Listed">Listed</option>
            <option value="Sold">Sold</option>
            <option value="Unlisted">Unlisted</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
