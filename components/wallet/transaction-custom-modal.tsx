"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  tx: any | null;
};

export default function TransactionCustomModal({ open, onClose, tx }: Props) {
  if (!open || !tx) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} // click outside closes modal
    >
      <div
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()} // prevent modal close when clicking inside
      >
        <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Description:</span>
            <span>{tx.description}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Type:</span>
            <span>{tx.type}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span>
              ₱{Number(tx.amount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span>{tx.status}</span>
          </div>

          {tx.reference_code && (
            <div className="flex justify-between">
              <span className="font-medium">Reference Code:</span>
              <span>{tx.reference_code}</span>
            </div>
          )}

          {tx.transaction_id && (
            <div className="flex justify-between">
              <span className="font-medium">Transaction ID:</span>
              <span>{tx.transaction_id}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>
              {new Date(tx.created_at).toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button
          className="mt-6 w-full py-2 rounded-md bg-gray-900 dark:bg-white dark:text-black text-white hover:bg-gray-700 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
