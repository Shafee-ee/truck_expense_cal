import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'


export const runtime = 'nodejs'

async function updateFixedCost(formData) {
    'use server'

    const id = formData.get('id')
    const dailyFixedCost = Number(formData.get('dailyFixedCost'))

    if (!dailyFixedCost || dailyFixedCost <= 0) {
        throw new Error('Daily fixed cost must be greater than 0')
    }

    await prisma.truck.update({
        where: { id },
        data: { dailyFixedCost },
    })

    redirect('/trips')
}

export default async function EditTruckPage(props) {

    const { id } = props.params;
    const truck = await prisma.truck.findUnique({
        where: { id },
    })

    if (!truck) notFound()

    return (
        <div className='p-6 max-w-md'>
            <h1 className='text-2xl font-bold mb-4'>Edit Truck:{truck.numberPlate}</h1>
            <form action={updateFixedCost} className='space-y-4'>
                <input type="hidden" name="id" value={truck.id} />
                <input type="number"
                    name="dailyFixedCost"
                    step="0.01"
                    defaultValue={truck.dailyFixedCost ?? ''}
                    placeholder='Daily Fixed Cost'
                    className='border p-2 w-full'
                    required />
                <button className='bg-black text-white px-4 py-2'>
                    update
                </button>
            </form>

        </div>
    )
}