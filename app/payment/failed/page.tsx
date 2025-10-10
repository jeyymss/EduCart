export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Payment Failed ❌
      </h1>
      <p>Something went wrong or you cancelled the payment.</p>
      <a href="/profile#settings" className="mt-6 text-blue-500 underline">
        Return to Profile
      </a>
    </div>
  );
}
