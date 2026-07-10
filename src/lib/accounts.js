import { prisma } from "@/lib/prisma";
import { calculateOutstanding, calculatePayments } from "@/lib/finance";

export async function getAccountsData() {
  const trips = await prisma.trip.findMany({
    include: {
      customerPayments: true,
      transporterPayments: true,

      truck: {
        include: {
          company: true,
        },
      },

      clientCompany: true,
      transporterCompany: true,
    },
  });

  const customerReceivablesMap = {};

  trips.forEach((trip) => {
    if (
      !trip.clientCompany ||
      trip.clientCompany.isInternal ||
      !trip.gcBalance
    ) {
      return;
    }

    const companyId = trip.clientCompany.id;

    if (!customerReceivablesMap[companyId]) {
      customerReceivablesMap[companyId] = {
        id: companyId,
        name: trip.clientCompany.name,
        receivable: 0,
        received: 0,
        outstanding: 0,
        tripCount: 0,
      };
    }

    const receivable = trip.gcBalance || 0;
    const received = calculatePayments(trip.customerPayments);
    const outstanding = calculateOutstanding(trip);

    customerReceivablesMap[companyId].receivable += receivable;
    customerReceivablesMap[companyId].received += received;
    customerReceivablesMap[companyId].outstanding += outstanding;
    customerReceivablesMap[companyId].tripCount += 1;
  });

  const customerReceivables = Object.values(customerReceivablesMap).sort(
    (a, b) => b.outstanding - a.outstanding
  );

  const transporterPayablesMap = {};

  trips.forEach((trip) => {
    if (!trip.transporterCompany || !trip.transporterPayable) {
      return;
    }

    const companyId = trip.transporterCompany.id;

    if (!transporterPayablesMap[companyId]) {
      transporterPayablesMap[companyId] = {
        id: companyId,
        name: trip.transporterCompany.name,
        payable: 0,
        paid: 0,
        remaining: 0,
        tripCount: 0,
      };
    }

    const payable = trip.transporterPayable || 0;

    const paid = calculatePayments(trip.transporterPayments);

    const remaining = payable - paid;

    transporterPayablesMap[companyId].payable += payable;
    transporterPayablesMap[companyId].paid += paid;
    transporterPayablesMap[companyId].remaining += remaining;
    transporterPayablesMap[companyId].tripCount += 1;
  });

  const transporterPayables = Object.values(transporterPayablesMap).sort(
    (a, b) => b.remaining - a.remaining
  );

  const totals = {
    receivable: customerReceivables.reduce(
      (sum, customer) => sum + customer.receivable,
      0
    ),

    received: customerReceivables.reduce(
      (sum, customer) => sum + customer.received,
      0
    ),

    payable: transporterPayables.reduce(
      (sum, transporter) => sum + transporter.payable,
      0
    ),

    paid: transporterPayables.reduce(
      (sum, transporter) => sum + transporter.paid,
      0
    ),
  };

  const outstandingCustomerTrips = trips
    .filter(
      (trip) =>
        trip.clientCompany &&
        !trip.clientCompany.isInternal &&
        calculateOutstanding(trip) > 0
    )
    .map((trip) => ({
      id: trip.id,
      truck: trip.truck.numberPlate,
      source: trip.source,
      destination: trip.destination,
      customer: trip.clientCompany.name,
      receivable: trip.gcBalance || 0,
      received: calculatePayments(trip.customerPayments),
      outstanding: calculateOutstanding(trip),
    }));

  const outstandingTransporterTrips = trips
    .filter(
      (trip) =>
        trip.transporterCompany &&
        (trip.transporterPayable || 0) >
          calculatePayments(trip.transporterPayments)
    )
    .map((trip) => ({
      id: trip.id,
      truck: trip.truck.numberPlate,
      source: trip.source,
      destination: trip.destination,
      transporter: trip.transporterCompany.name,
      payable: trip.transporterPayable || 0,
      paid: calculatePayments(trip.transporterPayments),
      remaining:
        (trip.transporterPayable || 0) -
        calculatePayments(trip.transporterPayments),
    }));

  return {
    customerReceivables,
    transporterPayables,
    outstandingCustomerTrips,
    outstandingTransporterTrips,
    totals,
  };
}
