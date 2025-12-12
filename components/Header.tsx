"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { ForSaleForm } from "./forms/ForSaleForm";
import { RentForm } from "./forms/RentForm";
import { TradeForm } from "./forms/TradeForm";
import { EmergencyForm } from "./forms/EmergencyForm";
import { PasaBuyForm } from "./forms/PasaBuyForm";
import { GiveawayForm } from "./forms/GiveawayForm";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  ArrowRight,
  BadgeCent,
  Bell,
  MessageSquare,
  Plus,
  User,
  Wallet,
  X,
} from "lucide-react";

export function Header() {
  const { data: user } = useUserProfile();
  const pathname = usePathname();
  const isConfirmPage = pathname?.startsWith("/confirm") ?? false;

  const isLoginPage = pathname === "/login";
  const isSignupPage =
    pathname === "/signup" || pathname === "/organization-account";
  const isLandingPage = pathname === "/";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
  if (!isLoggedIn) return;

  const loadNotifications = async () => {
    const res = await fetch("/api/notifications/get");
    const data = await res.json();
    if (!data.error) setNotifications(data.notifications);
  };

  loadNotifications();
}, [isLoggedIn]);

useEffect(() => {
  if (!user) return;

  const supabaseRT = createClient();

  const channel = supabaseRT
    .channel(`notifications:user:${user.user_id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.user_id}`,
      },
      (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabaseRT.removeChannel(channel);
  };
}, [user]);



  useEffect(() => {
    if (isConfirmPage) return;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    })();
  }, [supabase, isConfirmPage]);

  const handleLogout = async () => {
    setShowLogoutModal(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
    }, 2000);
  };

  const ProfilePage = () => router.push("/profile");
  const resetModal = () => setSelectedType("");

  if (isConfirmPage) return null;

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Browse", href: "/browse" },
    { label: "Businesses", href: "/businesses" },
    { label: "Organizations", href: "/organizations" },
  ];

  // 🔹 NEW: helper so Browse is active on /browse and /browse/*
  const isBrowseActive =
    pathname === "/browse" || pathname?.startsWith("/browse/");

  // Palette
  const primary = "#2F4157";
  const accent = "#E59E2C";
  const softAccent = "#F3D58D";

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full bg-white ${
          isLoggedIn ? "border-b" : ""
        }`}
        style={{ borderColor: `${primary}1A` }}
      >
        <div className="md:px-10 lg:px-20 px-6 py-3">
          <div className="grid grid-cols-3 items-center">
            {/* LOGO (left) */}
            <div className="flex items-center">
              <Link href={"/"}>
                <Image
                  alt="EduCart Logo"
                  src="/logo.png"
                  width={160}
                  height={0}
                  className="h-auto"
                />
              </Link>
            </div>

            {/* NAVIGATION CENTER */}
            {!isLandingPage && !isLoginPage && !isSignupPage ? (
              <nav className="hidden md:flex justify-center">
                <NavigationMenu>
                  <NavigationMenuList className="gap-6">
                    {navItems.map((item) => {
                      const isActive =
                        item.href === "/browse"
                          ? isBrowseActive
                          : pathname === item.href;

                      return (
                        <NavigationMenuItem key={item.href}>
                          <NavigationMenuLink
                            href={item.href}
                            className={`text-sm font-medium transition-all duration-200 hover:cursor-pointer ${
                              isActive ? "font-semibold" : ""
                            }`}
                            style={{
                              color: isActive ? accent : primary,
                              borderBottom: isActive
                                ? `2px solid ${accent}`
                                : "2px solid transparent",
                              paddingBottom: "4px",
                            }}
                          >
                            {item.label}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      );
                    })}
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>
            ) : (
              <div />
            )}

            {/* ACTIONS (right) */}
            <div className="hidden md:flex items-center justify-end space-x-5">
              {/* Logged-in actions (Cart, Credits, Messages, Profile) */}
              {isLoggedIn === true && (
                <>
                  {/* LIST dialog */}
                  <Dialog>
                    <DialogTrigger asChild onClick={resetModal}>
                      <Button
                        className="hover:cursor-pointer flex items-center gap-2 border-0"
                        style={{
                          backgroundColor: softAccent,
                          color: primary,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            accent;
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            softAccent;
                          (e.currentTarget as HTMLButtonElement).style.color =
                            primary;
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        List
                      </Button>
                    </DialogTrigger>

                    <DialogContent
                      onInteractOutside={(e) => e.preventDefault()}
                      onEscapeKeyDown={(e) => e.preventDefault()}
                    >
                      <DialogClose asChild>
                        <button
                          className="absolute right-2 top-2 rounded p-1 hover:cursor-pointer"
                          aria-label="Close"
                          style={{ color: primary }}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </DialogClose>
                      <DialogHeader>
                        <div className="text-center">
                          <DialogTitle style={{ color: primary }}>
                            Create Listing
                          </DialogTitle>
                          <DialogDescription>
                            What type of listing do you want to create?
                          </DialogDescription>
                        </div>
                      </DialogHeader>
                      <Select onValueChange={setSelectedType} value={selectedType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Listing Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sale">For Sale</SelectItem>
                          <SelectItem value="Rent">Rent</SelectItem>
                          <SelectItem value="Trade">Trade</SelectItem>
                          <SelectItem value="Emergency Lending">
                            Emergency Lending
                          </SelectItem>
                          <SelectItem value="PasaBuy">PasaBuy</SelectItem>
                          <SelectItem value="Giveaway">Giveaway</SelectItem>
                        </SelectContent>
                      </Select>
                      <div>
                        {selectedType === "Sale" && (
                          <ForSaleForm selectedType={selectedType} />
                        )}
                        {selectedType === "Rent" && (
                          <RentForm selectedType={selectedType} />
                        )}
                        {selectedType === "Trade" && (
                          <TradeForm selectedType={selectedType} />
                        )}
                        {selectedType === "Emergency Lending" && (
                          <EmergencyForm selectedType={selectedType} />
                        )}
                        {selectedType === "PasaBuy" && (
                          <PasaBuyForm selectedType={selectedType} />
                        )}
                        {selectedType === "Giveaway" && (
                          <GiveawayForm selectedType={selectedType} />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Credits (kept) */}
                  <div className="flex items-center gap-1" style={{ color: primary }}>
                    <Link href={"/credits/individual"} className="hover:opacity-80">
                      <BadgeCent className="w-4 h-4" />
                    </Link>
                    {user?.post_credits_balance}
                  </div>

                  {/* Messages + Wallet + Notifications + Profile */}
                  {/* MESSAGE BUTTON */}
                  <Link
                    href={"/messages"}
                    className="hover:opacity-80"
                    style={{ color: primary }}
                  >
                    <MessageSquare className="w-6 h-6" />
                  </Link>
                  {/* WALLET BUTTON */}
                  <Link
                    href={"/wallet"}
                    className="hover:opacity-80"
                    style={{ color: primary }}
                  >
                    <Wallet className="w-6 h-6" />
                  </Link>

                  {/* NOTIFICATIONS DROPDOWN */}
                  <DropdownMenu
                    open={notificationsOpen}
                    onOpenChange={setNotificationsOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hover:opacity-80 hover:cursor-pointer relative"
                        aria-label="Open notifications"
                        style={{ color: primary }}
                      >
                        <Bell className="w-6 h-6" />
                        {/* Unread badge */}
                        {notifications.filter((n) => !n.is_read).length > 0 && (
                          <span
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: "#E53E3E" }}
                          >
                            {notifications.filter((n) => !n.is_read).length}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[380px] max-h-[500px] overflow-y-auto p-0"
                    >
                      {/* Header */}
                      <div
                        className="px-4 py-3 border-b font-semibold"
                        style={{ color: primary }}
                      >
                        Notifications
                      </div>

                      {/* Notifications List */}
                      {notifications.length > 0 ? (
                        <div>
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                                !n.is_read ? "bg-blue-50" : ""
                              }`}
                              onClick={async () => {
                                // Mark as read
                                await fetch("/api/notifications/mark-read", {
                                  method: "POST",
                                  body: JSON.stringify({ id: n.id }),
                                });

                                setNotifications((prev) =>
                                  prev.map((x) =>
                                    x.id === n.id ? { ...x, is_read: true } : x
                                  )
                                );

                                // Close the dropdown
                                setNotificationsOpen(false);

                                // Redirect based on notification type
                                if (n.related_table === "offers" && n.related_id) {
                                  // Fetch the offer to get the post_id
                                  const { data: offer } = await supabase
                                    .from("offers")
                                    .select("post_id")
                                    .eq("id", n.related_id)
                                    .single();

                                  if (offer?.post_id) {
                                    router.push(`/product/${offer.post_id}`);
                                  }
                                } else if (n.related_table === "posts" && n.related_id) {
                                  // Direct post notification
                                  router.push(`/product/${n.related_id}`);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center mt-1"
                                  style={{
                                    backgroundColor: !n.is_read ? softAccent : "#E5E7EB",
                                  }}
                                >
                                  {n.category === "Message" && (
                                    <MessageSquare className="w-5 h-5" style={{ color: primary }} />
                                  )}
                                  {n.category === "Transaction" && (
                                    <Wallet className="w-5 h-5" style={{ color: primary }} />
                                  )}
                                  {n.category === "Review" && (
                                    <Plus className="w-5 h-5" style={{ color: primary }} />
                                  )}
                                  {n.category === "Comment" && (
                                    <MessageSquare className="w-5 h-5" style={{ color: primary }} />
                                  )}
                                  {n.category === "Report" && (
                                    <ArrowRight className="w-5 h-5" style={{ color: primary }} />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={`text-sm ${
                                      !n.is_read ? "font-semibold" : "font-medium"
                                    }`}
                                    style={{ color: primary }}
                                  >
                                    {n.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">{n.body}</p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(n.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No notifications
                        </div>
                      )}


                      {/* Footer */}
                      <div
                        className="px-4 py-3 border-t text-center text-sm font-medium hover:bg-gray-50 cursor-pointer"
                        style={{ color: accent }}
                        onClick={() => {
                          console.log("View all notifications clicked");
                          setNotificationsOpen(false);
                        }}
                      >
                        View all notifications
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* USER PROFILE DROPDOWN */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hover:opacity-80 hover:cursor-pointer"
                        aria-label="Open user menu"
                        style={{ color: primary }}
                      >
                        <User className="w-6 h-6" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={ProfilePage}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Logged-out actions (Sign Up / Log In) */}
              {!isLandingPage &&
                !isLoginPage &&
                !isSignupPage &&
                isLoggedIn === false && (
                  <>
                    <Link href="/signup">
                      <Button
                        className="shadow-none border-0 hover:cursor-pointer"
                        style={{
                          backgroundColor: "transparent",
                          color: primary,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = accent;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = primary;
                        }}
                      >
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        className="w-[175px] hover:cursor-pointer border-0"
                        style={{
                          backgroundColor: "#C7D9E5",
                          color: primary,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            "#122C4F";
                          (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            "#C7D9E5";
                          (e.currentTarget as HTMLButtonElement).style.color = primary;
                        }}
                      >
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT OVERLAY */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-medium animate-pulse" style={{ color: primary }}>
              Logging out...
            </h2>
            <div
              className="w-10 h-10 border-4 rounded-full animate-spin mx-auto"
              style={{ borderColor: `${accent}`, borderTopColor: "transparent" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
