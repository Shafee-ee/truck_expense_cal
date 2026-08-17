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

function numberOrNull(value) {
  if (value == null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function textOrNull(value) {
  if (value == null || value === "") {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}

export function mapTripRows(rows) {
  return rows
    .filter((row) => {
      const gcNumber = textOrNull(row["GC No."]);

      return gcNumber && gcNumber !== "GC No.";
    })
    .map((row) => ({
      gcNumber: textOrNull(row["GC No."]),
      billNumber: textOrNull(row["Bill No"]),

      vehicleNumber: textOrNull(row["Vehicle No."]),

      startDate: parseExcelDate(row["Load Date"]),
      endDate: parseExcelDate(row["Unload Date"]),

      billedDetails: textOrNull(row["Billed Details"]),
      source: textOrNull(row["From"]),
      destination: textOrNull(row["Destination"]),

      freightWeight: numberOrNull(row["Qty"]),
      ratePerUnit: numberOrNull(row["Rate/MT"]),

      billAmount: numberOrNull(row["Bill Amount"]),
      grossAmount: numberOrNull(row["Gross Amount"]),

      customer: textOrNull(row["Customer / Client"]),

      customerDiesel: numberOrNull(row["Customer Diesel"]) ?? 0,
      expenseDiesel: numberOrNull(row["Expense Diesel"]) ?? 0,
      customerAdvance: numberOrNull(row["Customer Advance"]) ?? 0,

      tds: numberOrNull(row["TDS"]) ?? 0,
      charges: numberOrNull(row["Thapal Charges"]) ?? 0,
      damageAmount: numberOrNull(row["Damage Amount"]) ?? 0,
      gcBalance: numberOrNull(row["GC Balance"]) ?? 0,

      toll: numberOrNull(row["Toll"]) ?? 0,
      loading: numberOrNull(row["Load & Unload"]) ?? 0,
      rto: numberOrNull(row["RTO Expenses"]) ?? 0,
      police: numberOrNull(row["Police"]) ?? 0,
      driver: numberOrNull(row["Driver Payment"]) ?? 0,
      other: numberOrNull(row["Other Expenses"]) ?? 0,

      notes: textOrNull(row["Notes"]),
    }));
}
