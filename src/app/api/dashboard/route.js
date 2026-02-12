import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const now = new Date()

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    )

    const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    )

    const closedTrips = await prisma.trip.findMany({
        where: {
            status: 'CLOSED',
            closedAt: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            },
        },
        select: {
            finalBalance: true,
        },
    })

    const operationalProfit = closedTrips.reduce(
        (sum, t) => sum + (t.finalBalance || 0),
        0
    )

    return NextResponse.json({
        operationalProfit,
    })
}
