import { redirect } from "next/navigation";
import CreateTruckForm from "@/components/CreateTruckForm";

export const runtime = "nodejs";

export default function NewTruckPage() {
  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add truck</h1>
      <CreateTruckForm />
    </div>
  );
}
