"use client";

import { useState } from "react";
import { updateMamool } from "@/app/trips/[id]/actions";

import { Save } from "lucide-react";

export default function MamoolEditor({ tripId, mamool }) {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <p className="text-zinc-500">Mamool</p>

      {!editing ? (
        <div className="mt-2 flex items-center gap-3">
          <p className="font-medium text-zinc-800">₹{mamool || 0}</p>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="
              rounded-md
              border
              border-zinc-300
              px-3
              py-1
              text-sm
              hover:bg-zinc-100
            "
          >
            Edit
          </button>
        </div>
      ) : (
        <form
          action={async (formData) => {
            await updateMamool(formData);
            setEditing(false);
          }}
          className="mt-2 flex gap-2"
        >
          <input type="hidden" name="tripId" value={tripId} />

          <input
            type="number"
            name="mamool"
            defaultValue={mamool || 0}
            max={3000}
            className="
              h-10
              w-28
              rounded-lg
              border
              border-zinc-300
              px-3
            "
          />

          <button
            className="
              rounded-lg
              bg-amber-500
              px-2
              text-white
            "
          >
            <Save />
          </button>
        </form>
      )}
    </div>
  );
}
