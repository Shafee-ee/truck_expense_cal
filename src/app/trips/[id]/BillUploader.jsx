"use client";

import { useRef, useState } from "react";

export default function BillUploader({
  id,
  expenseId,
  signedUrl,
  replaceBill,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  return (
    <form
      action={async (formData) => {
        await replaceBill(formData);
        setSelectedFile(null);
      }}
    >
      <input type="hidden" name="tripId" value={id} />
      <input type="hidden" name="expenseId" value={expenseId} />

      <input
        ref={fileInputRef}
        type="file"
        name="bill"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          setSelectedFile(file);

          e.target.form?.requestSubmit();
        }}
      />

      {signedUrl ? (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:underline"
        >
          📎 Invoice
        </a>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-zinc-500 hover:text-zinc-700 hover:underline"
        >
          No Bill
        </button>
      )}
    </form>
  );
}
