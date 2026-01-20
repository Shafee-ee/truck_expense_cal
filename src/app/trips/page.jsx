export const runtime = 'nodejs'
import { prisma } from '@/lib/prisma'

export default async function TripsPage() {

    const trips = await prisma.trip.findMany()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">
                Trips
            </h1>
            <p>
                Found {trips.length} trips.
            </p>
        </div>
    )
}