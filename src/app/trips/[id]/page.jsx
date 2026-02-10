export const runtime = 'nodejs'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

    const totalPayments = trip.payments.reduce(
        (sum, p) => sum + p.amount,
        0
    )


    const outstanding = revenue - totalPayments;
    const hasRevenue = trip.actualQty && trip.actualQty > 0;
    const hasOutstanding = outstanding > 0;
    const canClose = hasRevenue && !hasOutstanding && trip.expenses.length > 0;



    // check if trip is editable
    async function assertTripIsEditable(id) {
        'use server'

        console.log('assert Trip is editable id:', id)
        const freshTrip = await prisma.trip.findUnique({
            where: { id },
            select: { status: true },
        })

        if (!freshTrip || freshTrip.status === 'CLOSED') {
            throw new Error('Trip is closed and cannot be modified')
        }
    }


    const balance = revenue - totalExpenses;

    async function startTrip() {
        'use server'

        await assertTripIsEditable(id)

        await prisma.trip.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                startDate: new Date(),
            },
        })

        revalidatePath(`/trips/${id}`)
        revalidatePath('/trips')
    }



    //close trip
    async function closeTrip() {
        'use server'

        const freshTrip = await prisma.trip.findUnique({
            where: { id },
            include: {
                expenses: true,
                payments: true,
            },
        })

        if (!freshTrip) {
            throw new Error('Trip not found')
        }

        const revenue =
            (freshTrip.actualQty || 0) * (freshTrip.ratePerUnit || 0)

        const totalExpenses = freshTrip.expenses.reduce(
            (sum, e) => sum + e.amount,
            0
        )

        console.log({
            actualQty: freshTrip.actualQty,
            ratePerUnit: freshTrip.ratePerUnit,
        })

        const totalPayments = freshTrip.payments.reduce(
            (sum, p) => sum + p.amount,
            0
        )

        const outstanding = revenue - totalPayments
        const balance = revenue - totalExpenses

        if (freshTrip.expenses.length === 0) {
            throw new Error('Cannot close trip without expenses')
        }

        if (revenue <= 0) {
            throw new Error('Cannot close trip without valid revenue')
        }

        if (outstanding > 0) {
            throw new Error(
                `Cannot close trip. ₹${outstanding.toFixed(0)} still outstanding.`
            )
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


    //update actual quantity
    async function updateActualQty(formData) {
        'use server'

        const tripId = formData.get('tripId')
        const actualQty = Number(formData.get('actualQty'))

        if (!tripId) throw new Error('Trip ID missing')
        if (!actualQty || actualQty <= 0) {
            throw new Error('Actual quantity must be greater than 0')
        }

        await assertTripIsEditable(tripId)

        await prisma.trip.update({
            where: { id: tripId },
            data: {
                actualQty,
            },
        })

        revalidatePath(`/trips/${tripId}`)
    }


    // add expense
    async function addExpense(formData) {
        'use server'

        const tripId = formData.get('tripId')
        if (!tripId) {
            throw new Error('Trip ID missing')
        }

        await assertTripIsEditable(tripId)

        const category = formData.get('category')
        const amount = Number(formData.get('amount'))
        const note = formData.get('note') || null
        const file = formData.get('bill')

        console.log({
            hasFile: !!file,
            fileType: file?.constructor?.name,
            fileSize: file?.size,
            fileName: file?.name,
        })

        if (!amount || amount <= 0) return

        let billPath = null

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const fileExt = file.name.split('.').pop()
            const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`

            const { error } = await supabase.storage
                .from('bills')
                .upload(fileName, buffer, {
                    contentType: file.type,
                })

            if (error) {
                console.error('Supabase upload error:', error)
                throw new Error('Bill upload failed')
            }

            billPath = fileName
        }

        await prisma.expense.create({
            data: {
                tripId,
                category,
                amount,
                expenseDate: new Date(),
                note,
                billPath,
            },
        })

        revalidatePath(`/trips/${tripId}`)
    }


    //replace bill
    async function replaceBill(formData) {
        'use server'

        const tripId = formData.get('tripId')
        if (!tripId) throw new Error('Trip ID missing')

        await assertTripIsEditable(tripId)

        const expenseId = formData.get('expenseId')
        const file = formData.get('bill')
        if (!file || file.size === 0) return

        const expense = await prisma.expense.findUnique({
            where: { id: expenseId }
        })
        if (!expense) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`

        const { error } = await supabase.storage
            .from('bills')
            .upload(fileName, file, { contentType: file.type })

        if (error) return

        await prisma.expense.update({
            where: { id: expenseId },
            data: { billPath: fileName }
        })

        revalidatePath(`/trips/${tripId}`)
    }

    //add payment
    async function addPayment(formData) {
        'use server'

        const tripId = formData.get('tripId')
        if (!tripId) throw new Error('Trip ID missing')

        await assertTripIsEditable(tripId)

        await prisma.payment.create({
            data: {
                tripId,
                amount: Number(formData.get('amount')),
                type: formData.get('type'),
                mode: formData.get('mode'),
                paymentDate: new Date(),
                note: formData.get('note') || null,
            },
        })

        revalidatePath(`/trips/${tripId}`)
    }

    // Delete expense
    async function deleteExpense(formData) {
        'use server'

        const tripId = formData.get('tripId')
        const expenseId = formData.get('expenseId')

        if (!tripId || !expenseId) {
            throw new Error('Missing identifiers')
        }

        await assertTripIsEditable(tripId)

        await prisma.expense.delete({
            where: { id: expenseId }
        })

        revalidatePath(`/trips/${tripId}`)
    }




    return (
        <div className="p-10 space-y-4 bg-gray-200">

            <div className="mb-4">
                <Link href="/trips">
                    <button className="text-sm bg-blue-200 p-2 hover:bg-blue-300">
                        ← Back to Trips
                    </button>
                </Link>
            </div>


            {/*Trip detail and status*/}
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


            {/* Trip financial summary*/}
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

            <hr />

            {trip.status === 'ACTIVE' && (
                <div className="pt-4 border-t">
                    <h2 className="font-semibold mb-2">Actual Quantity</h2>

                    <form action={updateActualQty} className="space-y-2 max-w-sm">
                        <input type="hidden" name="tripId" value={id} />

                        <input
                            name="actualQty"
                            type="number"
                            step="0.01"
                            defaultValue={trip.actualQty ?? ''}
                            placeholder="Enter actual quantity"
                            className="border p-2 w-full"
                            required
                        />

                        <button className="bg-black text-white px-4 py-2">
                            Update Quantity
                        </button>
                    </form>
                </div>
            )}


            {/*Payments and outstanding amount summary*/}

            <div className="space-y-1">
                <div><strong>Total Paid:</strong> ₹{totalPayments.toFixed(0)}</div>
                <div>
                    <strong>Outstanding:</strong>{' '}
                    <span
                        className={
                            outstanding > 0
                                ? 'text-red-600'
                                : outstanding < 0
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                        }
                    >
                        ₹{outstanding.toFixed(0)}
                    </span>
                </div>
            </div>

            {/*Trip Lifecyle Action*/}
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
                            <p className="text-gray-600 font-semibold ">
                                Note: This action is final. Once closed, this trip cannot be edited.
                            </p>

                            <ul className="list-disc pl-5 space-y-1">
                                <li>Truck is correct</li>
                                <li>Route is correct</li>
                                <li>All expenses are entered</li>
                                <li>All bills are uploaded</li>
                                <li>Revenue and balance look correct</li>
                            </ul>

                            {!hasRevenue && (
                                <p className="text-red-600 font-semibold">
                                    Cannot close trip: Actual quantity is missing, so revenue is 0.
                                </p>
                            )}

                            {hasOutstanding && (
                                <p className="text-red-600 font-semibold">
                                    Cannot close trip- ₹{outstanding.toFixed(0)} is still outstanding.
                                </p>
                            )}


                            <form action={closeTrip}>
                                <button
                                    disabled={!canClose}
                                    className={`mt-3 px-4 py-2 text white ${canClose
                                        ? 'bg-red-600'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}

                                >
                                    Confirm & close
                                </button>
                            </form>
                        </div>
                    </details>
                )}

            </div>
            {/*expense management for ACTIVE trip*/}
            {trip.status === 'ACTIVE' && (
                <div className="pt-6 border-t">
                    <h2 className="font-semibold mb-2">Add Expense</h2>

                    <form action={addExpense}

                        className="space-y-2 max-w-sm">
                        <input type="hidden" name="tripId" value={id} />
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
                                                        <>
                                                            <form action={replaceBill}
                                                                className="inline">
                                                                <input type="hidden" name="tripId" value={id} />
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

                                                            <form action={deleteExpense} className="inline ml-2">
                                                                <input type="hidden" name="tripId" value={id} />
                                                                <input type="hidden" name="expenseId" value={e.id} />
                                                                <button className="text-xs text-red-600 underline">
                                                                    Delete
                                                                </button>
                                                            </form>
                                                        </>
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

            {/* add expense*/}
            {trip.status === 'ACTIVE' && (
                <div className="pt-6 border-t">
                    <h2 className="font-semibold mb-2">Record Payment</h2>

                    <form action={addPayment} className="space-y-2 max-w-sm">
                        <input type="hidden" name="tripId" value={id} />

                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            className="border p-2 w-full"
                            required
                        />

                        <select name="type" className="border p-2 w-full" required>
                            <option value="">Payment Type</option>
                            <option value="ADVANCE">Advance</option>
                            <option value="SETTLEMENT">Settlement</option>
                        </select>

                        <select name="mode" className="border p-2 w-full" required>
                            <option value="">Payment Mode</option>
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK">Bank</option>
                        </select>

                        <input
                            name="note"
                            placeholder="Note (optional)"
                            className="border p-2 w-full"
                        />

                        <button className="bg-black text-white px-4 py-2">
                            Add Payment
                        </button>
                    </form>
                </div>
            )}

            {/*Payment List / cash flow*/}
            {trip.payments.length > 0 && (
                <div className="pt-6 border-t">
                    <h2 className="font-semibold mb-2">Payments</h2>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-1">Date</th>
                                <th className="text-left py-1">Type</th>
                                <th className="text-left py-1">Mode</th>
                                <th className="text-right py-1">Amount</th>
                                <th className="text-left py-1">Note</th>
                            </tr>
                        </thead>

                        <tbody>
                            {trip.payments.map(p => (
                                <tr key={p.id} className="border-b">
                                    <td className="py-1">
                                        {new Date(p.paymentDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-1">{p.type}</td>
                                    <td className="py-1">{p.mode}</td>
                                    <td className="py-1 text-right">₹{p.amount}</td>
                                    <td className="py-1">{p.note || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}



            {/*Closed trip audit {read only}*/}
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
