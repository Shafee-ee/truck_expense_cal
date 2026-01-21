export const runtime = "nodejs"

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function NewTripPage() {
    async function createTrip(formData) {
        'use server'


        const truckId = formData.get('truckId')
        const source = formData.get('source')
        const destination = formData.get('destination')
        const estimatedQty = Number(formData.get('estimatedQty')) || null
        const ratePerUnit = Number(formData.get('ratePerUnit')) || null

        await prisma.trip.create({
            data: {
                truckId,
                source,
                destination,
                estimatedQty,
                ratePerUnit,
                status: 'PLANNED',
            },
        })

        redirect('/trips')
    }

    const trucks = await prisma.truck.findMany({
        orderBy: { numberPlate: 'asc' }
    })

    return (
        <div className='p-6 max-w-xl'>
            <h1 className='text-2xl font-bold mb-4'>
                Create Trip
            </h1>

            <form action={createTrip} className='space-y-4'>
                <div>
                    <label className='block text-sm font-medium'>Truck</label>
                    <select name="truckId" required className="border p-2 w-full">
                        <option value="">Select Truck</option>

                        {trucks.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.numberPlate}
                            </option>
                        ))}

                    </select>
                </div>

                <div>
                    <label className='block text-sm font-medium'>Source</label>
                    <input name="source" required className='border p-2 w-full' />
                </div>

                <div>
                    <label className="block text-sm font-medium">Destination</label>
                    <input name="destination" required className='borer p-2 w-full' />
                </div>

                <div>
                    <label className="block text-sm font-medium">Estimated Qty</label>
                    <input name="estimatedQty" type="number" step="0.01" className='border p-2 w-full' />
                </div>

                <div>
                    <label className="block text-sm font-medium ">Rate/Unit</label>
                    <input type="number" name="ratePerUnit" step="0.01" className='border p-2 w-full' />
                </div>

                <button className='bg-black text-white px-4 py-2'>
                    Create Trip
                </button>

            </form>

        </div>
    )
}