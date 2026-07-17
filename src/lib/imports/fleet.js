export function mapFleetRows(rows) {
  return rows.map((row) => ({
    numberPlate: row["Vehicle No"]?.trim() ?? null,
    vehicleType: row["Vehicle Type"]?.trim() ?? null,
    registrationDate: row["REG date"],

    compliance: {
      fitness: row["Fitness Certificate"],
      roadTax: row["Road Tax"],
      insurance: row["Insurance"],
      permit: row["PERMIT"] === "N/A" ? null : row["PERMIT"],
      nationalPermit:
        row["National Permit"] === "N/A" ? null : row["National Permit"],
    },
  }));
}
