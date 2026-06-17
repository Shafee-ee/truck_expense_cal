"use client";
import { useState } from "react";

export default function FileUpload() {
  const [fileName, setFileName] = useState("");

  return (
    <div className="border rpunded-p2 flex items-center justify-between">
      <label
        htmlFor="document"
        className="cursor-pointer rounded bg-black px-4 py-2 text-white"
      >
        Upload Document
      </label>
      <input
        type="file"
        id="document"
        name="document"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          setFileName(e.target.files?.[0]?.name || "");
        }}
      />
      <span className="text-sm text-gray-500">
        {fileName || "PDF or Image"}
      </span>
    </div>
  );
}
