function parseExcelDate(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));

    return new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
  }

  const text = value.toString().trim();

  const parts = text.split(/[./-]/);

  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts;

  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0)
  );
}
export function mapTripRows(rows) {
  const mappedRows = rows
    .filter((row) => {
      const gc = row["GC No."]?.toString().trim();

      return gc && gc !== "GC No.";
    })
    .map((row) => {
      const importSource =
        row["TOLL"] !== undefined ||
        row["Load & Unload"] !== undefined ||
        row["RTO EXPENSES"] !== undefined ||
        row["POLICE"] !== undefined ||
        row["Driver Balance"] !== undefined ||
        row["Other Expenses"] !== undefined
          ? "AS"
          : "LOGISCO";

      return {
        importSource,
        gcNumber: row["GC No."]?.toString().trim() || null,
        billNumber: row["Bill No"]?.toString().trim() || null,

        vehicleNumber: row["Vehicle No."] ?? row["Vehicle No"] ?? null,

        startDate: parseExcelDate(
          row["LOAD Date "] ??
            row["Load Date"] ??
            row["Load Date "] ??
            row["Date"] ??
            row["Date "]
        ),

        endDate: parseExcelDate(
          row["Unload Date"] ??
            row["Discharge Date"] ??
            row["Discharge date"] ??
            row["Date"] ??
            row["Date "]
        ),

        billedDetails: row["Billed Details"]?.toString().trim() || null,
        source: row["From"]?.toString().trim() || null,
        destination: row["Destination"]?.toString().trim() || null,

        freightWeight: Number(row["Qty"]) || null,
        ratePerUnit: Number(row["Rate/MT"]) || null,
        grossAmount: Number(row["Gross Amount"]) || null,

        transporter: row["Transporter"]?.toString().trim() || null,

        diesel: Number(row[" Diesel "] ?? row["Diesel"]) || 0,
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
      };
    });

  return mappedRows;
}
