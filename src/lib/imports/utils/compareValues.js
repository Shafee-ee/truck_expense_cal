export function compareValues(oldValue, newValue) {
  if (oldValue == null && newValue == null) {
    return true;
  }

  if (oldValue instanceof Date && newValue instanceof Date) {
    return (
      oldValue.getFullYear() === newValue.getFullYear() &&
      oldValue.getMonth() === newValue.getMonth() &&
      oldValue.getDate() === newValue.getDate()
    );
  }

  return String(oldValue ?? "").trim() === String(newValue ?? "").trim();
}
