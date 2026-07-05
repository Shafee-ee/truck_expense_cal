import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const monthParam = searchParams.get("month");

  const data = await getDashboardData(monthParam);

  return NextResponse.json(data);
}
