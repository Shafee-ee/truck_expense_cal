import { getAccountsData } from "@/lib/accounts";
import StatCard from "@/components/ui/StatCard";
import Table from "@/components/ui/Table";
import TableRow from "@/components/ui/TableRow";

export default async function AccountsPage() {
  const { customerReceivables, transporterPayables, totals, trips } =
    await getAccountsData();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Accounts</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Receivable"
          value={`₹${totals.receivable.toLocaleString()}`}
        />

        <StatCard
          title="Received"
          value={`₹${totals.received.toLocaleString()}`}
        />

        <StatCard
          title="Payable"
          value={`₹${totals.payable.toLocaleString()}`}
        />

        <StatCard title="Paid" value={`₹${totals.paid.toLocaleString()}`} />
      </div>

      <pre>{JSON.stringify(trips, null, 2)}</pre>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Customer Receivables</h2>

        <Table
          columns={[
            { key: "customer", label: "Customer" },
            { key: "receivable", label: "Receivable" },
            { key: "received", label: "Received" },
            { key: "outstanding", label: "Outstanding" },
            { key: "trips", label: "Trips" },
          ]}
        >
          {customerReceivables.map((customer) => (
            <TableRow key={customer.id}>
              <td className="px-4 py-3">{customer.name}</td>

              <td className="px-4 py-3">
                ₹{customer.receivable.toLocaleString()}
              </td>

              <td className="px-4 py-3">
                ₹{customer.received.toLocaleString()}
              </td>

              <td className="px-4 py-3 font-semibold">
                ₹{customer.outstanding.toLocaleString()}
              </td>

              <td className="px-4 py-3">{customer.tripCount}</td>
            </TableRow>
          ))}
        </Table>
      </section>
    </div>
  );
}
