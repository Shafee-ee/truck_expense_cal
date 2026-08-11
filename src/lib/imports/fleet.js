import { normalizeVehicleType } from "@/lib/imports/utils/normalize";

function normalizeExpiryDate(value) {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const text = String(value).trim().toUpperCase();

  if (text === "N/A" || text === "LTT") {
    return null;
  }

  const parts = text.split(".");

  if (parts.length === 3) {
    const [day, month, year] = parts;

    if (day.length === 2 && month.length === 2 && year.length === 4) {
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  return null;
}

export function mapFleetRows(rows) {
  console.log("FLEET ROW SAMPLE:", rows[0]);

  return rows.map((row) => ({
    numberPlate: row["Vehicle No"]?.trim() ?? null,
    vehicleType: normalizeVehicleType(row["Vehicle Type"]),
    registrationDate: row["REG date"],

    compliance: {
      fitness: normalizeExpiryDate(row["Fitness Certificate"]),
      roadTax: normalizeExpiryDate(row["Road Tax"]),
      insurance: normalizeExpiryDate(row["Insurance"]),
      permit: normalizeExpiryDate(row["PERMIT"]),
      nationalPermit: normalizeExpiryDate(row["National Permit"]),
    },
  }));
}
