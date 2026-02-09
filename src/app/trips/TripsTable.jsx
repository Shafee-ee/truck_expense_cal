"use client";

import { useRouter } from 'next/navigation';

export default function TripsTable({ trips }) {
    const router = useRouter();

    const getRowClass = (status) => {
        if (status === 'PLANNED') return 'bg-gray-50 text-gray-500';
        if (status === 'ACTIVE') return 'bg-amber-50';
        return '';
    };

    const getResultClass = (value) => {
        if (value > 0) return 'text-green-600 font-semibold';
        if (value < 0) return 'text-red-600 font-semibold';
        return '';
    };

    return (
        <table className="w-full">
            <thead>
                <tr className="border-b">
                    <th className="text-left py-2">Truck</th>
                    <th className="text-left py-2">Route</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Start Date</th>
                    <th className="text-left py-2">Result</th>
                </tr>
            </thead>

            <tbody>
                {trips.map((trip) => (
                    <tr
                        key={trip.id}
                        className={`border-b cursor-pointer hover:bg-gray-100 ${getRowClass(trip.status)}`}
                        onClick={() => router.push(`/trips/${trip.id}`)}
                    >
                        <td className="py-2">{trip.truck.numberPlate}</td>
                        <td className="py-2">{trip.source} → {trip.destination}</td>
                        <td className="py-2">{trip.status}</td>
                        <td className="py-2">
                            {trip.startDate
                                ? new Date(trip.startDate).toISOString().slice(0, 10)
                                : '-'}
                        </td>
                        <td className={`py-2 ${getResultClass(trip.result)}`}>
                            {trip.status === 'CLOSED'
                                ? trip.result >= 0
                                    ? `₹${trip.result.toFixed(0)}`
                                    : `-₹${Math.abs(trip.result).toFixed(0)}`
                                : '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
