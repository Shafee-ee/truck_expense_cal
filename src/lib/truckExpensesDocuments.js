import { supabase } from "@/lib/supabase";
export async function getTruckExpenseDocument(documentPath) {
  if (!documentPath) return null;

  const { data, error } = await supabase.storage
    .from("expense-bills")
    .createSignedUrl(documentPath, 60 * 10);

  if (error) return null;

  return data.signedUrl;
}
