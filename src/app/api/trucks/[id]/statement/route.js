import { NextResponse } from "next/server";
import { getTruckStatement } from "@/lib/getTruckStatement";

export async function GET(request, props) {
  const params = await props.params;

  const truckId = params.id;

  const { searchParams } = new URL(request.url);

  const monthParam = searchParams.get("month");

  const statement = await getTruckStatement(truckId, monthParam);

  if (!statement) {
    return NextResponse.json(
      {
        error: "Truck not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json(statement);
}
