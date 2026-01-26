export const runtime = 'nodejs'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getSignedUrl(path) {
    const { data } = await supabase.storage
        .from('bills')
        .createSignedUrl(path, 60 * 10)

    return data?.signedUrl || null
}

export default async function TripDetailPage(props) {
    const { id } = await props.params

    console.log('ID:', id);


    const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
            truck: true,
            expenses: true,
            payments: true,
        },
    })

    if (!trip) notFound()

    const revenue =
        (trip.actualQty || 0) * (trip.ratePerUnit || 0)

    const totalExpenses = trip.expenses.reduce(
        (sum, e) => sum + e.amount,
        0
    )

    function assertTripIsEditable() {
        if (trip.status === 'CLOSED') {
            throw new Error('Trip is closed and cannot be modified');
        }
    }

    const balance = revenue - totalExpenses;

    async function startTrip() {
        'use server'
        assertTripIsEditable()
        await prisma.trip.update({
            where: { id: id },
            data: {
                status: 'ACTIVE',
                startDate: new Date(),
            },
        })
        revalidatePath('/trips')
    }

    async function addPayment(formData) {
        'use server'
        assertTripIsEditable()

        await prisma.payment.create({
            data: {
                tripId: id,
                amount: Number(formData.get('amount')),
                type: formData.get('type'),
                mode: formData.get('mode'),
                paymentDate: new Date(),
                note: formData.get('note') || null,
            }
        })
        revalidatePath(`/trips/${id}`)
    }

    async function closeTrip() {
        'use server'

        // HARD VALIDATION (4.4)
        if (trip.expenses.length === 0) {
            throw new Error('Cannot close trip without expenses');
        }

        if (!revenue || revenue <= 0) {
            throw new Error('Cannot close trip without valid revenue');
        }

        await prisma.trip.update({
            where: { id },
            data: {
                status: 'CLOSED',
                endDate: new Date(),

                closedAt: new Date(),
                closedBy: 'operator', // placeholder

                finalRevenue: revenue,
                finalExpenses: totalExpenses,
                finalBalance: balance,
            },
        })

        revalidatePath(`/trips/${id}`)
        revalidatePath('/trips')
    }


    async function addExpense(formData) {
        'use server'

        assertTripIsEditable()


        const category = formData.get('category')
        const amount = Number(formData.get('amount'))
        const note = formData.get('note') || null
        const file = formData.get('bill')

        if (!amount || amount <= 0) return

        let billPath = null

        if (file && file.size > 0) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${id}/${crypto.randomUUID()}.${fileExt}`

            const { error } = await supabase.storage
                .from('bills')
                .upload(fileName, file, {
                    contentType: file.type,
                })

            if (!error) {
                billPath = fileName
            }
        }

        await prisma.expense.create({
            data: {
                tripId: id,
                category,
                amount,
                expenseDate: new Date(),
                note,
                billPath,
            },
        })
    }

    async function replaceBill(formData) {
        'use server'

        assertTripIsEditable()


        const expenseId = formData.get('expenseId')
        const file = formData.get('bill')

        if (!file || file.size === 0) return

        const expense = await prisma.expense.findUnique({
            where: { id: expenseId }
        })

        if (!expense) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${expense.tripId}/${crypto.randomUUID()}.${fileExt}`

        const { error } = await supabase.storage
            .from('bills')
            .upload(fileName, file, {
                contentType: file.type,
            })

        if (error) return

        await prisma.expense.update({
            where: { id: expenseId },
            data: { billPath: fileName }
        })
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">
                Trip Details
            </h1>

            <div className="space-y-1">
                <div><strong>Truck:</strong> {trip.truck.numberPlate}</div>
                <div><strong>Route:</strong> {trip.source} → {trip.destination}</div>
                <div>
                    <strong>Status:</strong>{' '}
                    <span className={trip.status === 'CLOSED' ? 'text-red-600 font-semibold' : ''}>
                        {trip.status}
                    </span>
                </div>                <div><strong>Start:</strong> {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '-'}</div>
                <div><strong>End:</strong> {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '-'}</div>
            </div>

            <hr />

            <div className="space-y-1">
                <div><strong>Revenue:</strong> ₹{revenue.toFixed(0)}</div>
                <div><strong>Expenses:</strong> ₹{totalExpenses.toFixed(0)}</div>
                <div>
                    <strong>Balance:</strong>{' '}
                    <span className={balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{balance.toFixed(0)}
                    </span>
                </div>
            </div>

            <div className="pt-4">
                {trip.status === 'PLANNED' && (
                    <form action={startTrip}>
                        <button className="bg-blue-600 text-white px-4 py-2">
                            Start Trip
                        </button>
                    </form>
                )}



                {trip.status === 'ACTIVE' && (
                    <details className="border p-4 rounded">
                        <summary className="cursor-pointer font-semibold text-red-600">
                            Review & Close Trip
                        </summary>

                        <div className="mt-4 space-y-3 text-sm">
                            <p className="text-red-600 font-semibold">
                                This action is final. Once closed, this trip cannot be edited.
                            </p>

                            <ul className="list-disc pl-5 space-y-1">
                                <li>Truck is correct</li>
                                <li>Route is correct</li>
                                <li>All expenses are entered</li>
                                <li>All bills are uploaded</li>
                                <li>Revenue and balance look correct</li>
                            </ul>

                            <form action={closeTrip}>
                                <button className="mt-3 bg-red-600 text-white px-4 py-2">
                                    Confirm & Close Trip
                                </button>
                            </form>
                        </div>
                    </details>
                )}

            </div>

            {trip.status === 'ACTIVE' && (
                <div className="pt-6 border-t">
                    <h2 className="font-semibold mb-2">Add Expense</h2>

                    <form action={addExpense} className="space-y-2 max-w-sm">
                        <select name="category" className="border p-2 w-full" required>
                            <option value="">Select Category</option>
                            <option value="FUEL">Fuel</option>
                            <option value="TOLL">Toll</option>
                            <option value="POLICE">Police</option>
                            <option value="LOADING">Loading</option>
                            <option value="UNLOADING">Unloading</option>
                            <option value="REPAIR">Repair</option>
                            <option value="OTHER">Other</option>
                        </select>

                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            className="border p-2 w-full"
                            required
                        />

                        <input
                            name="note"
                            placeholder="Note (optional)"
                            className="border p-2 w-full"
                        />

                        <input
                            type="file"
                            name="bill"
                            accept="image/*,application/pdf"
                            className="border p-2 w-full"
                        />

                        <button className="bg-black text-white px-4 py-2">
                            Add Expense
                        </button>
                    </form>

                    {trip.expenses.length > 0 && (
                        <div className="pt-6 border-t">
                            <h2 className="font-semibold mb-2">Expenses</h2>

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-1">Date</th>
                                        <th className="text-left py-1">Category</th>
                                        <th className="text-right py-1">Amount</th>
                                        <th className="text-left py-1">Note</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {await Promise.all(trip.expenses.map(async (e) => {
                                        const signedUrl = e.billPath
                                            ? await getSignedUrl(e.billPath)
                                            : null

                                        return (
                                            <tr key={e.id} className="border-b">
                                                <td className="py-1">
                                                    {new Date(e.expenseDate).toLocaleDateString()}
                                                </td>
                                                <td className="py-1">{e.category}</td>
                                                <td className="py-1 text-right">₹{e.amount}</td>
                                                <td className="py-1">{e.note || '-'}</td>
                                                <td className="py-1">
                                                    {signedUrl && (
                                                        <a
                                                            href={signedUrl}
                                                            target="_blank"
                                                            className="text-blue-600 underline mr-2"
                                                        >
                                                            View Bill
                                                        </a>
                                                    )}

                                                    {trip.status === 'ACTIVE' && (
                                                        <form action={replaceBill} className="inline">
                                                            <input type="hidden" name="expenseId" value={e.id} />
                                                            <input
                                                                type="file"
                                                                name="bill"
                                                                accept="image/*,application/pdf"
                                                                className="text-xs"
                                                                required
                                                            />
                                                            <button className="ml-1 text-xs underline">
                                                                Replace
                                                            </button>
                                                        </form>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    }))}


                                </tbody>

                            </table>
                        </div>
                    )}

                </div>
            )}

            {trip.status === 'CLOSED' && (
                <div className="pt-6 border-t bg-gray-50 p-4 rounded">
                    <h2 className="font-semibold text-red-700 mb-2">
                        Trip Certified & Locked
                    </h2>

                    <div className="text-sm space-y-1">
                        <div>
                            <strong>Certified On:</strong>{' '}
                            {trip.closedAt
                                ? new Date(trip.closedAt).toLocaleString()
                                : '-'}
                        </div>

                        <div>
                            <strong>Certified By:</strong>{' '}
                            {trip.closedBy || '—'}
                        </div>

                        <hr className="my-2" />

                        <div>
                            <strong>Final Revenue:</strong>{' '}
                            ₹{trip.finalRevenue?.toFixed(0)}
                        </div>

                        <div>
                            <strong>Final Expenses:</strong>{' '}
                            ₹{trip.finalExpenses?.toFixed(0)}
                        </div>

                        <div>
                            <strong>Final Balance:</strong>{' '}
                            <span
                                className={
                                    trip.finalBalance >= 0
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }
                            >
                                ₹{trip.finalBalance?.toFixed(0)}
                            </span>
                        </div>

                        <p className="text-xs text-gray-600 mt-2">
                            This trip is locked. No further changes are permitted.
                        </p>
                    </div>
                </div>
            )}



        </div>
    )
}
