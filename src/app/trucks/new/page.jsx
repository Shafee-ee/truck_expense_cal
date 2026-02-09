import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

async function createTruck(formData) {
    'use server'

    const numberPlate = formData.get('numberPlate')?.trim()

    if (!numberPlate) {
        throw new Error('truck number plate is required')
    }

    //find or create default company

    let company = await prisma.company.findFirst({
        where: { name: 'Logisco' },
    })

    if (!company) {
        company = await prisma.company.create({
            data: { name: 'Logisco' }
        })
    }

    //create truck

    try {
        await prisma.truck.create({
            data: {
                numberPlate,
                companyId: company.id,
            }
        })
    } catch (err) {
        throw new Error('Truck with this number plate already exists')
    }

    redirect('/trips')
}


export default function NewTruckPage() {
    return (
        <div className='p-6 max-w-md'>
            <h1 className='text-2xl font-bold mb-4'>Add truck</h1>
            <form action={createTruck} className='space-y-4'>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Truck number plate
                    </label>

                    <input type="text"
                        name="numberPlate"
                        placeholder='TN09AB1234'
                        className='border p-2 w-full'
                        required />
                </div>

                <button className='bg-black text-white px-4 py-2'>
                    Save Truck
                </button>

            </form>
        </div>
    )
}