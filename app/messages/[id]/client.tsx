"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Camera, FilePenLine, X } from "lucide-react";
import PostTypeBadge from "@/components/postTypeBadge";
import SaleTransacForm from "@/components/transaction/forms/SaleTransac";
import TradeTransacForm from "@/components/transaction/forms/TradeTransac";
import RentTransacForm from "@/components/transaction/forms/RentTransac";
import LiveTransactionCard from "@/components/transaction/liveTransaction";
import PasaBuyTransacForm from "@/components/transaction/forms/PasaBuyTransac";
import EmergencyTransacForm from "@/components/transaction/forms/EmergencyTransac";
import GiveawayTransacForm from "@/components/transaction/forms/GiveawayTransac";

type ChatMessage = {
  id: number;
  conversation_id: number;
  sender_user_id: string | null;
  body: string | null;
  attachments: string[] | null;
  created_at: string;
  type?: "user" | "system";
  transaction_id?: string | null;
  transactions?: {
    id: string;
    item_title: string;
    post_types: { id: number; name: string };
    rent_start_date: string;
    rent_end_date: string;
    cash_added: number | null;
    offered_item: string;
    price: number | null;
    fulfillment_method: string | null;
    payment_method: string | null;
    meetup_location: string | null;
    meetup_date: string | null;
    meetup_time: string | null;
    status: string | null;
    created_at: string;
    post_id?: {
      item_trade: string;
    } | null;
  } | null;
};

export default function ChatClient({
  conversationId,
  currentUserId,
  currentUserRole,
  initialMessages,
  otherUserName,
  otherUserAvatarUrl,
  otherUserId,
  postId,
  itemImage,
  itemTitle,
  postType,
  itemPrice,
  itemTrade,
  itemServiceFee,
  itemPasabuyLocation,
  itemPasabuyCutoff,
  transactionHistory,
}: {
  conversationId: number;
  currentUserId: string;
  currentUserRole: "buyer" | "seller";
  initialMessages: ChatMessage[];
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  otherUserId: string;
  postId: string;
  itemImage: string | null;
  itemTitle: string | null;
  postType: string | null;
  itemPrice: number | null;
  itemTrade: string;
  itemServiceFee: number;
  itemPasabuyLocation: string;
  itemPasabuyCutoff: string;
  transactionHistory?: any[];
}) {
  const supabase = useMemo(() => createClient(), []); // Stable instance
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pendingText, setPendingText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transactionPollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(
    initialMessages.length > 0 ? Math.max(...initialMessages.map((m) => m.id)) : 0
  );
  const previousMessagesLengthRef = useRef(initialMessages.length);
  const isUserScrolledUpRef = useRef(false);
  const userJustSentMessageRef = useRef(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Track if user has scrolled up
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      isUserScrolledUpRef.current = !isAtBottom;
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto scroll to bottom with smart behavior
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const hasNewMessages = messages.length > previousMessagesLengthRef.current;

    // Always scroll if:
    // 1. User just sent a message (like Messenger/Facebook)
    // OR
    // 2. New messages arrived AND user is at the bottom
    const shouldScroll =
      userJustSentMessageRef.current ||
      (hasNewMessages && !isUserScrolledUpRef.current);

    if (shouldScroll) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
      // Reset the flag after scrolling
      userJustSentMessageRef.current = false;
      isUserScrolledUpRef.current = false;
    }

    // Update refs
    previousMessagesLengthRef.current = messages.length;
    if (messages.length > 0) {
      const maxId = Math.max(...messages.map((m) => m.id));
      if (maxId > lastMessageIdRef.current) {
        lastMessageIdRef.current = maxId;
      }
    }
  }, [messages]);

  // Polling for new messages - always active for reliability
  useEffect(() => {
    // Poll every 1 second for new messages
    const pollMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `*,
          transactions (
            id,
            item_title,
            price,
            rent_start_date,
            rent_end_date,
            offered_item,
            cash_added,
            created_at,
            fulfillment_method,
            payment_method,
            meetup_location,
            meetup_date,
            meetup_time,
            status,
            post_types (id, name),
            post_id (
              item_trade
            )
          )`
        )
        .eq("conversation_id", conversationId)
        .gt("id", lastMessageIdRef.current)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages((prev) => {
          // Prevent duplicates
          const newMessages = data.filter(
            (newMsg) => !prev.some((existingMsg) => existingMsg.id === newMsg.id)
          );
          if (newMessages.length > 0) {
            lastMessageIdRef.current = Math.max(...data.map((m) => m.id));
            return [...prev, ...(newMessages as ChatMessage[])];
          }
          return prev;
        });
      }
    };

    // Poll immediately on mount
    pollMessages();

    // Then poll every 1.5 seconds
    pollingIntervalRef.current = setInterval(pollMessages, 1500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversationId, supabase]);

  // Poll for transaction status updates
  useEffect(() => {
    const pollTransactions = async () => {
      // Fetch all transactions for this conversation
      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("id, status, fulfillment_method, payment_method, meetup_location, meetup_date, meetup_time")
        .eq("conversation_id", conversationId);

      if (!error && transactions && transactions.length > 0) {
        // Update messages with latest transaction status
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.transaction_id && msg.transactions) {
              const updatedTxn = transactions.find((t) => t.id === msg.transaction_id);
              if (updatedTxn && updatedTxn.status !== msg.transactions.status) {
                return {
                  ...msg,
                  transactions: {
                    ...msg.transactions,
                    status: updatedTxn.status,
                    fulfillment_method: updatedTxn.fulfillment_method ?? msg.transactions.fulfillment_method,
                    payment_method: updatedTxn.payment_method ?? msg.transactions.payment_method,
                    meetup_location: updatedTxn.meetup_location ?? msg.transactions.meetup_location,
                    meetup_date: updatedTxn.meetup_date ?? msg.transactions.meetup_date,
                    meetup_time: updatedTxn.meetup_time ?? msg.transactions.meetup_time,
                  },
                };
              }
            }
            return msg;
          })
        );
      }
    };

    // Poll immediately
    pollTransactions();

    // Then poll every 2 seconds for transaction updates
    transactionPollingRef.current = setInterval(pollTransactions, 2000);

    return () => {
      if (transactionPollingRef.current) {
        clearInterval(transactionPollingRef.current);
      }
    };
  }, [conversationId, supabase]);

  // Send normal user message
  async function sendMessage() {
    const trimmedBody = pendingText.trim();
    if (!trimmedBody && selectedFiles.length === 0) return;

    try {
      const uploadedUrls: string[] = [];

      // Upload files if any
      for (const file of selectedFiles) {
        const ext = file.name.split(".").pop();
        const filePath = `${conversationId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-uploads")
          .upload(filePath, file);

        if (uploadError) {
          alert("Upload failed: " + uploadError.message);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("chat-uploads")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      // Send text message if there is one
      if (trimmedBody) {
        const { error: textError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_user_id: currentUserId,
            body: trimmedBody,
            attachments: null,
            type: "user",
          });

        if (textError) {
          alert("Failed to send message. Please try again.");
          return;
        }
      }

      // Send image messages
      for (const url of uploadedUrls) {
        await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_user_id: currentUserId,
            body: null,
            attachments: [url],
            type: "user",
          });
      }

      // Mark that user just sent a message - will trigger auto-scroll
      userJustSentMessageRef.current = true;

      // Clear input fields only after successful send
      setPendingText("");
      setSelectedFiles([]);
    } catch (error) {
      alert("An error occurred while sending the message.");
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  async function handleUpdateTransaction(
    transactionId: string,
    newStatus: string
  ) {
    try {
      // Store the original status for potential rollback
      const originalMessage = messages.find(
        (msg) => msg.transaction_id === transactionId
      );
      const originalStatus = originalMessage?.transactions?.status;

      // Optimistically update the UI immediately
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.transaction_id === transactionId && msg.transactions) {
            return {
              ...msg,
              transactions: {
                ...msg.transactions,
                status: newStatus,
              },
            };
          }
          return msg;
        })
      );

      // Update transaction status in database
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: newStatus })
        .eq("id", transactionId);

      if (updateError) {
        // Revert optimistic update on error
        if (originalStatus) {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.transaction_id === transactionId && msg.transactions) {
                return {
                  ...msg,
                  transactions: {
                    ...msg.transactions,
                    status: originalStatus,
                  },
                };
              }
              return msg;
            })
          );
        }
        alert("Failed to update transaction status. Please try again.");
        return;
      }

      // Insert a NEW system message with the updated transaction
      // This will make the transaction card appear at the bottom as a new message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_user_id: currentUserId,
        transaction_id: transactionId,
        type: "system",
        body: `Transaction ${newStatus}`,
        attachments: null,
      });

      // Mark that user just sent a message - will trigger auto-scroll
      userJustSentMessageRef.current = true;

      // The polling will handle updating the UI for both users
    } catch (error) {
      alert("An error occurred while updating the transaction.");
    }
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Sticky Wrapper for header + item preview */}
        <div className="sticky top-0 z-20 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              {otherUserAvatarUrl ? (
                <Image
                  src={otherUserAvatarUrl}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-200" />
              )}
              <div className="font-medium">{otherUserName}</div>
            </div>

            <Link href={`/${otherUserId}`}>
              <button className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100 hover:cursor-pointer">
                Visit
              </button>
            </Link>
          </div>

          {/* Item Preview */}
          <Link
            href={`/product/${postId}`}
            className="flex items-center gap-3 p-4 border-t bg-white"
          >
            {itemImage && (
              <Image
                src={itemImage}
                alt={itemTitle ?? "Item"}
                width={56}
                height={56}
                className="h-20 w-20 rounded-md object-fill"
              />
            )}

            <div className="space-y-2">
              <PostTypeBadge
                type={postType as any}
                className="text-xs text-slate-500"
              />

              {postType === "Sale" && (
                <>
                  <p className="text-sm font-medium truncate">{itemTitle}</p>
                  {itemPrice && (
                    <p className="text-xs text-[#E59E2C]">
                      ₱{itemPrice.toLocaleString()}
                    </p>
                  )}
                </>
              )}

              {postType === "Rent" && (
                <>
                  <p className="text-sm font-medium truncate">{itemTitle}</p>
                  {itemPrice && (
                    <p className="text-xs text-[#E59E2C]">
                      ₱{itemPrice.toLocaleString()} / Day
                    </p>
                  )}
                </>
              )}

              {postType === "Trade" && (
                <>
                  <p className="text-sm font-medium truncate">{itemTitle}</p>
                  {itemPrice && (
                    <p className="text-xs text-[#E59E2C]">
                      ₱{itemPrice.toLocaleString()} + Trade for{" "}
                      <b>{itemTrade}</b>
                    </p>
                  )}
                </>
              )}

              {(postType === "PasaBuy" ||
                postType === "Emergency Lending") && (
                <p className="text-sm font-medium truncate">{itemTitle}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50"
        >
          {(() => {
            // Find the most recent message for each transaction_id
            const latestTransactionMessages = new Map<string, number>();
            messages.forEach((msg) => {
              if (msg.type === "system" && msg.transaction_id) {
                const existingMsgId = latestTransactionMessages.get(msg.transaction_id);
                if (!existingMsgId || msg.id > existingMsgId) {
                  latestTransactionMessages.set(msg.transaction_id, msg.id);
                }
              }
            });

            return messages.map((messageRow) => {
              const formattedTime = new Date(
                messageRow.created_at
              ).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });

              // SYSTEM MESSAGES (transaction forms)
              if (messageRow.type === "system" && messageRow.transactions) {
                // Only show the most recent system message for each transaction
                if (
                  messageRow.transaction_id &&
                  latestTransactionMessages.get(messageRow.transaction_id) !== messageRow.id
                ) {
                  return null; // Skip old transaction messages
                }

                const txn = messageRow.transactions;

                return (
                  <div key={messageRow.id} className="flex justify-center w-full">
                    <div className="bg-slate-100 border rounded-lg p-4 text-sm max-w-md">
                      {/* Always show LiveTransactionCard for all statuses */}
                      <LiveTransactionCard
                        key={messageRow.id}
                        post_type={postType ?? "Unknown"}
                        txn={txn}
                        formattedTime={formattedTime}
                        currentUserRole={currentUserRole}
                        handleUpdateTransaction={handleUpdateTransaction}
                      />
                    </div>
                  </div>
                );
              }

            // REGULAR TEXT / IMAGE MESSAGES
            const isFromCurrentUser =
              messageRow.sender_user_id === currentUserId;

            if (messageRow.attachments && messageRow.attachments.length > 0) {
              return messageRow.attachments.map((url, idx) => (
                <div
                  key={`${messageRow.id}-${idx}`}
                  className={`flex ${
                    isFromCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-2 ${
                      isFromCurrentUser
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    <Image
                      src={url}
                      alt="uploaded"
                      width={250}
                      height={250}
                      className="rounded-lg object-cover w-full h-auto cursor-pointer"
                      onClick={() => setPreviewUrl(url)}
                    />
                    <p
                      className={`text-xs mt-1 ${
                        isFromCurrentUser ? "text-blue-100" : "text-gray-500"
                      } text-right`}
                    >
                      {formattedTime}
                    </p>
                  </div>
                </div>
              ));
            }

            // TEXT MESSAGES
            return (
              <div
                key={messageRow.id}
                className={`flex ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isFromCurrentUser
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  <p>{messageRow.body}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isFromCurrentUser ? "text-blue-100" : "text-gray-500"
                    } text-right`}
                  >
                    {formattedTime}
                  </p>
                </div>
              </div>
            );
            });
          })()}
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex gap-2 p-2 border-t bg-white">
            {selectedFiles.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div key={idx} className="relative">
                  <Image
                    src={previewUrl}
                    alt="preview"
                    width={60}
                    height={60}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="absolute top-0 right-0 bg-black/70 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-0 left-0 right-0 border-t p-3 flex gap-2 bg-white z-30">
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded hover:bg-gray-100 hover:cursor-pointer"
                >
                  <Camera className="text-[#E59E2C]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Attachment</p>
              </TooltipContent>
            </Tooltip>
            
            {(
              (currentUserRole === "buyer" && postType !== "Giveaway") ||
              (currentUserRole === "seller" && postType === "Giveaway")
            ) && (
              <Tooltip>
                <Dialog open={open} onOpenChange={setOpen}>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="px-2 py-2 rounded hover:bg-gray-100 hover:cursor-pointer"
                        onClick={() => setOpen(true)}
                      >
                        <FilePenLine />
                      </button>
                    </DialogTrigger>
                  </TooltipTrigger>

                  <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    className="overflow-visible"
                  >
                    <DialogClose asChild>
                      <button
                        className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-200 hover:cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </DialogClose>

                    <DialogHeader>
                      <div className="flex items-center">
                        <DialogTitle>Form</DialogTitle>
                        <PostTypeBadge type={postType as any} />
                      </div>
                      <DialogDescription>Fill up form</DialogDescription>
                    </DialogHeader>

                    {/* Your forms here */}
                    {postType === "Sale" && (
                      <SaleTransacForm
                        conversationId={conversationId}
                        itemPrice={itemPrice}
                        itemTitle={itemTitle}
                        sellerId={otherUserId}
                        post_id={postId}
                        postType={postType || ""}
                        onClose={() => {
                          setOpen(false);
                          setShowSuccess(true);
                        }}
                      />
                    )}

                    {postType === "Rent" && (
                      <RentTransacForm
                        conversationId={conversationId}
                        itemPrice={itemPrice}
                        itemTitle={itemTitle}
                        sellerId={otherUserId}
                        post_id={postId}
                        postType={postType || ""}
                        onClose={() => {
                          setOpen(false);
                          setShowSuccess(true);
                        }}
                      />
                    )}

                    {postType === "Trade" && (
                      <TradeTransacForm
                        conversationId={conversationId}
                        itemPrice={itemPrice}
                        itemTrade={itemTrade}
                        itemTitle={itemTitle}
                        sellerId={otherUserId}
                        post_id={postId}
                        postType={postType || ""}
                        onClose={() => {
                          setOpen(false);
                          setShowSuccess(true);
                        }}
                      />
                    )}

                    {postType === "PasaBuy" && (
                      <PasaBuyTransacForm
                        conversationId={conversationId}
                        itemPrice={itemPrice}
                        itemTitle={itemTitle}
                        sellerId={otherUserId}
                        post_id={postId}
                        postType={postType || ""}
                        onClose={() => {
                          setOpen(false);
                          setShowSuccess(true);
                        }}
                      />
                    )}

                    {postType === "Emergency Lending" && (
                      <EmergencyTransacForm
                        conversationId={conversationId}
                        itemTitle={itemTitle}
                        sellerId={otherUserId}
                        post_id={postId}
                        postType={postType || ""}
                        onClose={() => {
                          setOpen(false);
                          setShowSuccess(true);
                        }}
                      />
                    )}

                    {postType === "Giveaway" && (
                      <GiveawayTransacForm
                        conversationId={conversationId}
                        itemTitle={itemTitle}
                        sellerId={otherUserId}
                        post_id={postId}
                        postType={postType || ""}
                        onClose={() => {
                          setOpen(false);
                          setShowSuccess(true);
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <TooltipContent>
                  <p>Fill Up Form</p>
                </TooltipContent>
              </Tooltip>
            )}


          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <Input
            value={pendingText}
            onChange={(e) => setPendingText(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button className="bg-[#E59E2C]" onClick={sendMessage}>
            Send
          </Button>
        </div>
      </div>

      {/* ✅ Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Transaction Submitted</DialogTitle>
            <DialogDescription>
              Your transaction form has been sent successfully. Please wait for
              the seller to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                setShowSuccess(false);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogTitle className="text-white text-sm px-4 py-2" />
        <DialogContent className="border-none bg-transparent p-0 flex items-center justify-center">
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="preview"
              width={1600}
              height={1200}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

