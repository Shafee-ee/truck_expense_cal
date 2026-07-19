export function normalizeVehicleType(value) {
  if (!value) return null;

  switch (value.trim().toUpperCase()) {
    case "TRUCK":
      return "TRUCK";

    case "CAR":
      return "CAR";

    case "TEMPO":
      return "TEMPO";

    default:
      return value.trim().toUpperCase();
  }
}
