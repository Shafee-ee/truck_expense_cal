export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'


import { prisma } from '@/lib/prisma';
import TripsTable from './TripsTable';

export default async function TripsPage() {
    const trips = await prisma.trip.findMany({
        include: {
            truck: true,
            expenses: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const processedTrips = trips.map((trip) => {
        let result = null;

        if (trip.status === 'CLOSED') {
            const revenue =
                (trip.actualQty || 0) * (trip.ratePerUnit || 0);

            const totalExpenses = trip.expenses.reduce(
                (sum, e) => sum + e.amount,
                0
            );

            result = revenue - totalExpenses;
        }

        return {
            ...trip,
            result,
        };
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Trips</h1>
            <TripsTable trips={processedTrips} />
        </div>
    );
}
