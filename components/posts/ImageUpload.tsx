"use client";

import { useRef } from "react";
import { X, Upload } from "lucide-react";

type Props = {
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  maxFiles?: number;
};

export default function ImageUploader({
  selectedFiles,
  setSelectedFiles,
  maxFiles = 10,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const fileMap = new Map(
      selectedFiles.map((file) => [file.name + file.lastModified, file])
    );

    files.forEach((file) => {
      const key = file.name + file.lastModified;
      if (!fileMap.has(key)) {
        fileMap.set(key, file);
      }
    });

    const newFiles = Array.from(fileMap.values()).slice(0, maxFiles);
    setSelectedFiles(newFiles);

    // Reset input value to allow re-selection of the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-wrap gap-2 w-full">
        {selectedFiles.map((file, i) => (
          <div
            key={i}
            className="relative w-[86px] h-[80px] rounded-md overflow-hidden border border-gray-300"
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${i}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(i)}
              className="absolute top-0.5 right-0.5 bg-white hover:bg-red-500 hover:text-white text-black p-[2px] rounded-full shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {selectedFiles.length < maxFiles && (
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center text-center border-2 border-dashed border-[#CACACA] hover:border-orange-400 rounded-md cursor-pointer transition
              ${
                selectedFiles.length === 0 ? "w-full py-4" : "w-[86px] h-[80px]"
              }
            `}
          >
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              name="itemImage"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            <div className="bg-orange-50 p-2 rounded-full">
              <Upload className="w-4 h-4 text-orange-400" />
            </div>

            {selectedFiles.length === 0 && (
              <>
                <p className="text-orange-500 text-xs font-medium">
                  Click to Upload
                </p>
                <p className="text-[10px] text-gray-400">(Max: {maxFiles})</p>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
