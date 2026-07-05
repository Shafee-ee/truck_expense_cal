import { prisma } from "@/lib/prisma";
import EditTruckForm from "@/components/EditTruckForm";
export const runtime = "nodejs";
export default async function EditTruckPage(props) {
  const params = await props.params;
  const truck = await prisma.truck.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!truck) {
    return <div className="p-6"> Truck not found</div>;
  }

  return (
    <div className="max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Edit:{truck.numberPlate}</h1>
      <EditTruckForm truck={truck} />
    </div>
  );
}
