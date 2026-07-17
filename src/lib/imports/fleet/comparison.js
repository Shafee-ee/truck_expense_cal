import { prisma } from "@/lib/prisma";
import { compareValues } from "@/lib/imports/utils/compareValues";

const fieldsToCompare = [
  {
    key: "vehicleType",
    label: "Vehicle Type",
  },
  {
    key: "registrationDate",
    label: "Registration Date",
  },
];

export async function compareFleetRows(rows) {
  const comparison = [];

  for (const [index, row] of rows.entries()) {
    const truck = await prisma.truck.findUnique({
      where: {
        numberPlate: row.numberPlate,
      },
    });

    const changes = [];

    if (truck) {
      for (const field of fieldsToCompare) {
        const oldValue = truck[field.key];
        const newValue = row[field.key];

        console.log({
          truck: row.numberPlate,
          field: field.label,
          oldValue,
          newValue,
          compare: compareValues(oldValue, newValue),
        });

        if (!compareValues(oldValue, newValue)) {
          changes.push({
            field: field.label,
            oldValue,
            newValue,
          });
        }
      }
    }
    comparison.push({
      rowNumber: index + 1,
      action: !truck ? "CREATE" : changes.length > 0 ? "UPDATE" : "UNCHANGED",
      changes,
      row,
    });
  }

  return comparison;
}
