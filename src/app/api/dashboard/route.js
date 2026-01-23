import { prisma } from "@/lib/prisma";

export async function GET() {
    const activeTrips = await prisma.trip.count({
        where: { status: "ACTIVE" },
    });

    const cashDeployedResult = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
            trip: { status: "ACTIVE" }
        },
    });

    return Response.json({
        statusStrip: {
            activeTrips,
            cashDeployed,
        },
    });
}
