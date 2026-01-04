"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  useSchools,
  useCreateSchool,
  useUpdateSchool,
  useDeleteSchool,
  type School,
} from "@/hooks/queries/admin/useSchools";

export default function SchoolsPage() {
  const { data: schools, isLoading, isError, error } = useSchools();
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Form states
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolAbbreviation, setNewSchoolAbbreviation] = useState("");
  const [newSchoolDomain, setNewSchoolDomain] = useState("");
  const [editSchoolName, setEditSchoolName] = useState("");
  const [editSchoolAbbreviation, setEditSchoolAbbreviation] = useState("");
  const [editSchoolDomain, setEditSchoolDomain] = useState("");

  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) {
      toast.error("Please enter a school name");
      return;
    }

    if (!newSchoolAbbreviation.trim()) {
      toast.error("Please enter an abbreviation");
      return;
    }

    try {
      await createSchool.mutateAsync({
        name: newSchoolName,
        abbreviation: newSchoolAbbreviation,
        domain: newSchoolDomain.trim() || undefined,
      });
      toast.success("School created successfully");
      setAddDialogOpen(false);
      setNewSchoolName("");
      setNewSchoolAbbreviation("");
      setNewSchoolDomain("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create school");
    }
  };

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setEditSchoolName(school.name);
    setEditSchoolAbbreviation(school.abbreviation);
    setEditSchoolDomain(school.domain || "");
    setEditDialogOpen(true);
  };

  const handleUpdateSchool = async () => {
    if (!selectedSchool || !editSchoolName.trim()) {
      toast.error("Please enter a school name");
      return;
    }

    if (!editSchoolAbbreviation.trim()) {
      toast.error("Please enter an abbreviation");
      return;
    }

    try {
      await updateSchool.mutateAsync({
        id: selectedSchool.id,
        name: editSchoolName,
        abbreviation: editSchoolAbbreviation,
        domain: editSchoolDomain.trim() || undefined,
      });
      toast.success("School updated successfully");
      setEditDialogOpen(false);
      setSelectedSchool(null);
      setEditSchoolName("");
      setEditSchoolAbbreviation("");
      setEditSchoolDomain("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update school");
    }
  };

  const handleDeleteSchool = (school: School) => {
    setSelectedSchool(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSchool) return;

    try {
      await deleteSchool.mutateAsync(selectedSchool.id);
      toast.success("School deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedSchool(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete school");
    }
  };

  const getStatusBadge = () => {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  };

  if (isLoading) return <p className="mt-6 text-sm text-gray-500">Loading schools...</p>;
  if (isError) return <p className="mt-6 text-sm text-red-500">Error: {error.message}</p>;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">School Management</h1>
            <p className="text-sm text-slate-500">
              Manage educational institutions on the platform
            </p>
          </div>

          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add School
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#FEF7E5] text-gray-800">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Abbreviation</th>
                <th className="px-6 py-3 font-semibold">Users</th>
                <th className="px-6 py-3 font-semibold">Domain</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!schools || schools.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No schools found
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr
                    key={school.id}
                    className="bg-white hover:bg-[#f5eeda] transition-colors border-b last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {school.name}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {school.abbreviation}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {school.user_count}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {school.domain || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge()}
                    </td>

                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditSchool(school)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit School
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteSchool(school)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete School
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add School Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add School</DialogTitle>
            <DialogDescription>
              Create a new educational institution on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                placeholder="Enter school name"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-abbreviation">Abbreviation</Label>
              <Input
                id="school-abbreviation"
                placeholder="Enter abbreviation (e.g., MIT, UCLA)"
                value={newSchoolAbbreviation}
                onChange={(e) => setNewSchoolAbbreviation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-domain">Domain</Label>
              <Input
                id="school-domain"
                placeholder="Enter domain (e.g., mit.edu)"
                value={newSchoolDomain}
                onChange={(e) => setNewSchoolDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddSchool();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setNewSchoolName("");
                setNewSchoolAbbreviation("");
                setNewSchoolDomain("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSchool}
              disabled={createSchool.isPending}
            >
              {createSchool.isPending ? "Creating..." : "Add School"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update the school information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-school-name">School Name</Label>
              <Input
                id="edit-school-name"
                placeholder="Enter school name"
                value={editSchoolName}
                onChange={(e) => setEditSchoolName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school-abbreviation">Abbreviation</Label>
              <Input
                id="edit-school-abbreviation"
                placeholder="Enter abbreviation"
                value={editSchoolAbbreviation}
                onChange={(e) => setEditSchoolAbbreviation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school-domain">Domain</Label>
              <Input
                id="edit-school-domain"
                placeholder="Enter domain (e.g., mit.edu)"
                value={editSchoolDomain}
                onChange={(e) => setEditSchoolDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateSchool();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedSchool(null);
                setEditSchoolName("");
                setEditSchoolAbbreviation("");
                setEditSchoolDomain("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSchool}
              disabled={updateSchool.isPending}
            >
              {updateSchool.isPending ? "Updating..." : "Update School"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete School Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the school &quot;{selectedSchool?.name}&quot;.
              {selectedSchool?.user_count && selectedSchool.user_count > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This school has {selectedSchool.user_count} user(s) and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSchool.isPending || (selectedSchool?.user_count ?? 0) > 0}
            >
              {deleteSchool.isPending ? "Deleting..." : "Delete School"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
