export function mapTripRows(rows) {
  return rows.map((row) => ({
    gcNumber: row["GC No."]?.toString().trim() || null,
    billNumber: row["Bill No"]?.toString().trim() || null,

    vehicleNumber: row["Vehicle No."] ?? row["Vehicle No"] ?? null,
    startDate: row["Load Date"] || row["Date"] || null,
    endDate: row["Discharge Date"] || null,

    source: row["From"]?.toString().trim() || null,
    destination: row["Destination"]?.toString().trim() || null,

    freightWeight: Number(row["Qty"]) || null,
    ratePerUnit: Number(row["Rate/MT"]) || null,
    grossAmount: Number(row["Gross Amount"]) || null,

    transporter: row["Transporter"]?.toString().trim() || null,

    diesel: Number(row["Diesel"]) || 0,
    advance: Number(row["Advance"]) || 0,

    toll: Number(row["TOLL"]) || 0,
    loading: Number(row["Load & Unload"]) || 0,
    rto: Number(row["RTO EXPENSES"]) || 0,
    police: Number(row["POLICE"]) || 0,
    driver: Number(row["Driver Balance"]) || 0,
    other: Number(row["Other Expenses"]) || 0,

    tds: Number(row["TDS"]) || 0,
    charges: Number(row["THAPAL CHARGES"]) || 0,
    damageAmount: Number(row["Damage Amount"]) || 0,
  }));
}
