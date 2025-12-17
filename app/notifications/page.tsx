"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  MessageSquare,
  Wallet,
  Plus,
  ArrowRight,
  ShieldAlert,
  Ban,
  Bell,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import dynamic from "next/dynamic";

const MobileTopNav = dynamic(() => import("@/components/mobile/MobileTopNav"), {
  ssr: false,
});

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: string;
  is_read: boolean;
  related_table?: string;
  related_id?: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { data: user } = useUserProfile();

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/notifications/get");
        const data = await res.json();
        if (!data.error) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
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
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }

    // Redirect based on notification type
    if (notification.related_table === "offers" && notification.related_id) {
      // Fetch the offer to get the post_id
      const { data: offer } = await supabase
        .from("offers")
        .select("post_id")
        .eq("id", notification.related_id)
        .single();

      if (offer?.post_id) {
        router.push(`/product/${offer.post_id}`);
      }
    } else if (
      notification.related_table === "posts" &&
      notification.related_id
    ) {
      // Direct post notification
      router.push(`/product/${notification.related_id}`);
    }
  };

  const getNotificationIcon = (category: string) => {
    const primary = "#102E4A";
    switch (category) {
      case "Message":
        return <MessageSquare className="w-5 h-5" style={{ color: primary }} />;
      case "Transaction":
        return <Wallet className="w-5 h-5" style={{ color: primary }} />;
      case "Review":
        return <Plus className="w-5 h-5" style={{ color: primary }} />;
      case "Comment":
        return <MessageSquare className="w-5 h-5" style={{ color: primary }} />;
      case "Report":
        return <ArrowRight className="w-5 h-5" style={{ color: primary }} />;
      case "Warning Issued":
        return <ShieldAlert className="w-5 h-5" style={{ color: "#D97706" }} />;
      case "Suspension":
        return <Ban className="w-5 h-5" style={{ color: "#DC2626" }} />;
      default:
        return <Bell className="w-5 h-5" style={{ color: primary }} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileTopNav />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-[#102E4A]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#E59E2C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer ${
                  !notification.is_read ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.is_read ? "bg-[#F3D58D]" : "bg-gray-100"
                    }`}
                  >
                    {getNotificationIcon(notification.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`text-sm ${
                          !notification.is_read ? "font-semibold" : "font-medium"
                        } text-[#102E4A]`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-[#E59E2C] rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
