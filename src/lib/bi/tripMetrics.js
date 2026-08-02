export function calculateTripMetrics(trip) {
  const revenue = trip.finalRevenue ?? 0;

  const expenses = trip.finalExpenses ?? 0;

  const profit = trip.finalBalance ?? 0;

  const tripDays = trip.tripDays ?? 0;

  return {
    id: trip.id,

    source: trip.source,
    destination: trip.destination,

    revenue,
    expenses,
    profit,

    tripDays,

    earningsPerDay: tripDays > 0 ? profit / tripDays : 0,

    isLossMaking: profit < 0,

    status: trip.status,
  };
}
