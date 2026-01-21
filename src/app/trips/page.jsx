export const runtime = 'nodejs'
import { prisma } from '@/lib/prisma'

export default async function TripsPage() {

    const trips = await prisma.trip.findMany({
        include: {
            truck: true,
            expenses: true,
        },
        orderBy: {
            createdAt: 'desc',
        },

    })

    const calculateResult = (trip) => {
        if (trip.status !== 'CLOSED') return null

        const revenue =
            (trip.actualQty || 0) * (trip.ratePerUnit || 0)

        const totalExpenses = trip.expenses.reduce(
            (sum, e) => sum + e.amount,
            0
        )

        return revenue - totalExpenses
    }

    const getRowClass = (status) => {
        if (status === 'PLANNED') return 'bg-gray-50 text-gray-500'
        if (status === 'ACTIVE') return 'bg-amber-50'
        return ''
    }

    const getResultClass = (value) => {
        if (value > 0) return 'text-green-600 font-semibold'
        if (value < 0) return 'text-red-600 font-semibold'
        return ''
    }

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                Trips
            </h1>

            <table>
                <thead>
                    <tr className='border-b'>
                        <th className='text-left py-2'>Truck</th>
                        <th className='text-left py-2'>Route</th>
                        <th className='text-left py-2'>Status</th>
                        <th className='text-left py-2'>Start Date</th>
                        <th className='text-left py-2'>Result</th>
                    </tr>
                </thead>

                <tbody>
                    {trips.map((trip) => {
                        const result = calculateResult(trip)
                        return (
                            <tr key={trip.id} className={`border-b ${getRowClass(trip.status)}`}>
                                <td className='py-2'>
                                    {trip.truck.numberPlate}
                                </td>

                                <td className='py-2'>
                                    {trip.source} → {trip.destination}
                                </td>

                                <td className='py-2'>
                                    {trip.status}
                                </td>

                                <td className='py-2'>
                                    {
                                        trip.startDate
                                            ? new Date(trip.startDate).toLocaleDateString()
                                            : '-'
                                    }

                                </td>

                                <td className={`py-2 ${getResultClass(result)}`}>
                                    {
                                        trip.status === 'CLOSED'
                                            ? result >= 0
                                                ? `₹${result.toFixed(0)}`
                                                : `-₹${Math.abs(result).toFixed(0)}`
                                            : '-'
                                    }
                                </td>
                            </tr>
                        )

                    })}


                </tbody>
            </table>



        </div>
    )
}