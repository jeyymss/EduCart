"use client";
import { useState } from "react";

export function OCRUploader() {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setName(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "https://ocr-api-production-53ff.up.railway.app/api/ocr",
        {
          method: "POST",
          body: formData,
        }
      );

      const raw = await res.text(); // Always read raw first

      try {
        const data = JSON.parse(raw);
        if (data.error) {
          setError(data.error);
        } else {
          setName(data.Name);
        }
      } catch {
        setError("Invalid response from server");
        console.error("❌ Failed to parse JSON. Raw response:", raw);
      }
    } catch (err) {
      setError("Network or OCR error");
      console.error("❌ Error calling OCR API:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto p-4 border rounded">
      <label className="block font-medium text-lg">Upload your ID:</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p className="text-blue-500">⏳ Processing...</p>}
      {name && (
        <p className="text-green-600 font-semibold">Extracted Name: {name}</p>
      )}
      {error && <p className="text-red-600 font-medium">⚠️ {error}</p>}
    </div>
  );
}
