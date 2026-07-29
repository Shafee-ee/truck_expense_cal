export function mapFastagRows(rows) {
  return rows
    .filter((row) => row["Type of Transaction"] === "Toll Txn")
    .map((row, index) => ({
      rowNumber: index + 23,

      amount: Number(row["Debit Amt"] || 0),

      expenseDate: row["Transaction Date"]
        ? new Date(row["Transaction Date"])
        : null,

      fastagTransactionId:
        row["Unique Transaction ID"]?.toString().trim() || null,

      fastagTagId: row["TAGID"]?.toString().trim() || null,

      fastagPlazaCode: row["Plaza Code"]?.toString().trim() || null,

      fastagPlazaName:
        row["Transaction Description"]
          ?.replace(/^Plaza Name:\s*/i, "")
          .trim() || null,

      fastagProcessingAt: row["Processing Date"]
        ? new Date(row["Processing Date"])
        : null,

      vehicleNumber: row["VRN"]?.toString().trim() || null,

      note: null,
    }));
}
