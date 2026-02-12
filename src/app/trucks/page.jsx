import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const runtime = 'nodejs'


export default async function TrucksPage() {
    const trucks = await prisma.truck.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold mb-4'>
                Trucks
            </h1>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='w-full text-sm'>
                        <th className='text-left py-2'>Number Plate</th>
                        <th className='text-left py-2'>Daily Fixed Cost</th>
                        <th className='text-left py-2'>Action</th>

                    </tr>
                </thead>
                <tbody>
                    {trucks.map((truck) => (
                        <tr key={truck.id} className='border-b'>
                            <td className='py-2 text-right'>
                                ₹{truck.dailyFixedCost ?? 0}
                            </td>
                            <td className='py-2 text-right'>
                                <Link
                                    href={`/trucks/${truck.id}`}
                                    className='text-blue-600 underline'
                                >
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='mt-4'>
                <Link
                    href="/trucks/new"
                    className='bg-black text-white px-4 py-2 inline-block'
                >
                    Add Truck
                </Link>

            </div>
        </div>
    )
}