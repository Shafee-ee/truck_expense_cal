import { getAccountsData } from "@/lib/accounts";
import StatCard from "@/components/ui/StatCard";
import Table from "@/components/ui/Table";
import TableRow from "@/components/ui/TableRow";

export default async function AccountsPage() {
  const {
    customerReceivables,
    transporterPayables,
    outstandingCustomerTrips,
    outstandingTransporterTrips,
    totals,
  } = await getAccountsData();

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
      {transporterPayables.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Transporter Payables</h2>

          <Table
            columns={[
              { key: "transporter", label: "Transporter" },
              { key: "payable", label: "Payable" },
              { key: "paid", label: "Paid" },
              { key: "remaining", label: "Remaining" },
              { key: "trips", label: "Trips" },
            ]}
          >
            {transporterPayables.map((transporter) => (
              <TableRow key={transporter.id}>
                <td className="px-4 py-3">{transporter.name}</td>

                <td className="px-4 py-3">
                  ₹{transporter.payable.toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  ₹{transporter.paid.toLocaleString()}
                </td>

                <td className="px-4 py-3 font-semibold text-red-600">
                  ₹{transporter.remaining.toLocaleString()}
                </td>

                <td className="px-4 py-3">{transporter.tripCount}</td>
              </TableRow>
            ))}
          </Table>
        </section>
      )}

      {outstandingTransporterTrips.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Outstanding Customer Trips</h2>

          <Table
            columns={[
              { key: "truck", label: "Truck" },
              { key: "route", label: "Route" },
              { key: "customer", label: "Customer" },
              { key: "receivable", label: "Receivable" },
              { key: "received", label: "Received" },
              { key: "outstanding", label: "Outstanding" },
            ]}
          >
            {outstandingCustomerTrips.map((trip) => (
              <TableRow key={trip.id}>
                <td className="px-4 py-3 font-medium">{trip.truck}</td>

                <td className="px-4 py-3">
                  {trip.source} → {trip.destination}
                </td>

                <td className="px-4 py-3">{trip.customer}</td>

                <td className="px-4 py-3">
                  ₹{trip.receivable.toLocaleString()}
                </td>

                <td className="px-4 py-3">₹{trip.received.toLocaleString()}</td>

                <td className="px-4 py-3 font-semibold text-red-600">
                  ₹{trip.outstanding.toLocaleString()}
                </td>
              </TableRow>
            ))}
          </Table>
        </section>
      )}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Outstanding Transporter Trips</h2>

        <Table
          columns={[
            { key: "truck", label: "Truck" },
            { key: "route", label: "Route" },
            { key: "transporter", label: "Transporter" },
            { key: "payable", label: "Payable" },
            { key: "paid", label: "Paid" },
            { key: "remaining", label: "Remaining" },
          ]}
        >
          {outstandingTransporterTrips.map((trip) => (
            <TableRow key={trip.id}>
              <td className="px-4 py-3 font-medium">{trip.truck}</td>

              <td className="px-4 py-3">
                {trip.source} → {trip.destination}
              </td>

              <td className="px-4 py-3">{trip.transporter}</td>

              <td className="px-4 py-3">₹{trip.payable.toLocaleString()}</td>

              <td className="px-4 py-3">₹{trip.paid.toLocaleString()}</td>

              <td className="px-4 py-3 font-semibold text-red-600">
                ₹{trip.remaining.toLocaleString()}
              </td>
            </TableRow>
          ))}
        </Table>
      </section>
    </div>
  );
}
