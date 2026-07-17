export default function ImportActionBadge({ action }) {
  const styles = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-yellow-100 text-yellow-700",
    UNCHANGED: "bg-gray-100 text-gray-700",
    ERROR: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[action]}`}
    >
      {action}
    </span>
  );
}
