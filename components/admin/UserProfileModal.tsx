"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Wallet,
  ShoppingBag,
  CreditCard,
  Mail,
  GraduationCap,
  Package,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPostsList } from "@/components/admin/UserPostsList";

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfileData {
  profile: {
    user_id: string;
    name: string;
    email: string;
    bio: string | null;
    university: string | null;
    role: string;
    avatar_url: string | null;
    background_url: string | null;
    credits: number;
    created_at: string;
  };
  wallet: {
    current_balance: number;
    escrow_balance: number;
  };
  transactionsCount: number;
  totalPosts: number;
  posts: any[];
}

function initialsFrom(name?: string) {
  if (!name) return "ED";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  valueColor = "text-gray-900",
  iconColor = "text-[#FDB813]"
}: {
  icon: any;
  label: string;
  value: string | number;
  valueColor?: string;
  iconColor?: string;
}) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#FDB813]/30 transition-all duration-200 hover:shadow-md">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br from-[#FEF7E5] to-[#FDB813]/10`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-lg font-bold ${valueColor} mt-0.5`}>{value}</p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="mt-0.5 p-1.5 rounded-md bg-gray-100">
      <Icon className="h-4 w-4 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 break-words">{value}</p>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-gray-200 rounded-xl" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-200 rounded-lg" />
      ))}
    </div>
  </div>
);

export function UserProfileModal({ userId, open, onOpenChange }: UserProfileModalProps) {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchUserProfile();
    } else if (!open) {
      // Reset state when modal closes
      setData(null);
      setError(null);
    }
  }, [open, userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/profile?userId=${userId}`);
      const responseData = await res.json();

      if (res.ok) {
        setData(responseData);
      } else {
        setError(responseData.error || "Failed to load user profile");
        toast.error(responseData.error || "Failed to load user profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("An error occurred while loading the profile");
      toast.error("An error occurred while loading the profile");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "organization":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "individual":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>User Profile - {data?.profile.name || 'Loading...'}</DialogTitle>
        </VisuallyHidden>
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="p-4 rounded-full bg-red-50 mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchUserProfile} variant="outline">
              Try Again
            </Button>
          </div>
        ) : data ? (
          <>
            {/* Close Button - Fixed */}
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg z-50"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Scrollable Content */}
            <ScrollArea className="h-[95vh]">
              <div className="relative">
                {/* Header with Background */}
                <div className="relative">
                  {/* Background Image */}
                  <div className="h-40 relative overflow-hidden" style={{ backgroundColor: data.profile.background_url ? 'transparent' : '#E5E7EB' }}>
                    {data.profile.background_url && (
                      <>
                        <img
                          src={data.profile.background_url}
                          alt="Background"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="px-8 -mt-12 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <Avatar className="h-28 w-28 border-4 border-white shadow-xl ring-2 ring-gray-100">
                        <AvatarImage
                          src={data.profile.avatar_url || "/avatarplaceholder.png"}
                          alt={data.profile.name}
                        />
                        <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-[#FDB813] to-[#FDB813]/70 text-white">
                          {initialsFrom(data.profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 w-full sm:mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.profile.name}</h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" />
                                {data.profile.email}
                              </p>
                              <Badge className={`${getRoleBadgeColor(data.profile.role)} border font-medium w-fit`}>
                                {data.profile.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-8 pt-2 pb-8 space-y-6">
                {/* Bio Section */}
                {data.profile.bio && (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="pt-5 pb-5">
                      <p className="text-sm text-gray-700 leading-relaxed">{data.profile.bio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={CreditCard}
                    label="Post Credits"
                    value={data.profile.credits.toFixed(2)}
                    valueColor="text-[#FDB813]"
                    iconColor="text-[#FDB813]"
                  />
                  <StatCard
                    icon={Wallet}
                    label="Wallet Balance"
                    value={`₱${data.wallet.current_balance.toFixed(2)}`}
                    valueColor="text-green-600"
                    iconColor="text-green-600"
                  />
                  <StatCard
                    icon={ShoppingBag}
                    label="Transactions"
                    value={data.transactionsCount}
                    valueColor="text-blue-600"
                    iconColor="text-blue-600"
                  />
                  <StatCard
                    icon={Package}
                    label="Total Listings"
                    value={data.totalPosts}
                    valueColor="text-purple-600"
                    iconColor="text-purple-600"
                  />
                </div>

                {/* Account Information */}
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="pt-6 pb-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#FDB813]" />
                      Account Information
                    </h3>
                    <div className="space-y-1">
                      <InfoRow
                        icon={GraduationCap}
                        label="University"
                        value={data.profile.university || "Not specified"}
                      />
                      <Separator className="my-2" />
                      <InfoRow
                        icon={Mail}
                        label="Email Address"
                        value={data.profile.email}
                      />
                      <Separator className="my-2" />
                      <InfoRow
                        icon={Calendar}
                        label="Member Since"
                        value={formatDate(data.profile.created_at)}
                      />
                      <Separator className="my-2" />
                      <InfoRow
                        icon={Wallet}
                        label="Escrow Balance"
                        value={`₱${data.wallet.escrow_balance.toFixed(2)}`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Listings */}
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="pt-6 pb-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#FDB813]" />
                        Recent Listings
                      </h3>
                      <Badge variant="secondary" className="font-medium">
                        {data.posts?.length || 0} of {data.totalPosts}
                      </Badge>
                    </div>

                    <UserPostsList posts={data.posts || []} totalPosts={data.totalPosts} />
                  </CardContent>
                </Card>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
