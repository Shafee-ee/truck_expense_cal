"use client";

import { useRef, useState } from "react";
import { BookX, RefreshCcw, Upload, ExternalLink } from "lucide-react";

export default function BillUploader({
  id,
  expenseId,
  signedUrl,
  replaceBill,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const formRef = useRef(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await replaceBill(formData);
        setSelectedFile(null);
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="tripId" value={id} />

      <input type="hidden" name="expenseId" value={expenseId} />

      <label
        htmlFor={`bill-${expenseId}`}
        className="
          group
          relative
          flex
          h-16
          w-16
          cursor-pointer
          items-center
          justify-center
          overflow-hidden
          rounded-lg
          border
          border-zinc-200
          bg-zinc-50
          hover:border-zinc-400
          hover:bg-zinc-100
          transition
        "
      >
        {signedUrl ? (
          <>
            <img
              src={previewUrl || signedUrl}
              alt="Bill"
              className="h-full w-full object-contain bg-white p-1"
            />

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/40
                opacity-0
                transition
                group-hover:opacity-100
              "
            >
              <RefreshCcw className="h-4 w-4 text-white" />
            </div>
          </>
        ) : (
          <BookX className="h-6 w-6 text-zinc-400" />
        )}
      </label>

      <input
        id={`bill-${expenseId}`}
        type="file"
        name="bill"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;

          setSelectedFile(file);

          if (file) {
            setPreviewUrl(URL.createObjectURL(file));
          }
        }}
      />

      {!!selectedFile && (
        <button
          type="submit"
          className="
            rounded-md
            border
            border-zinc-300
            p-2
            text-zinc-600
            hover:bg-zinc-100
          "
        >
          <Upload className="h-4 w-4" />
        </button>
      )}

      {signedUrl && (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
      rounded-md
      border
      border-zinc-300
      p-2
      text-zinc-600
      hover:bg-zinc-100
    "
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </form>
  );
}
