"use client";
import { Fragment, useState } from "react";
import ImportActionBadge from "./ImportActionBadge";
export default function ImportPreviewTable({ rows }) {
  const [expandedRow, setExpandedRow] = useState(null);
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          <th>Row</th>
          <th>Vehicle</th>
          <th>Action</th>
          <th>Changes</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <Fragment key={row.rowNumber}>
            <tr
              onClick={() =>
                setExpandedRow(
                  expandedRow === row.rowNumber ? null : row.rowNumber
                )
              }
              className="cursor-pointer hover:bg-gray-50"
            >
              <td>{row.rowNumber}</td>

              <td>{row.row.numberPlate}</td>

              <td>
                <ImportActionBadge action={row.action} />
              </td>

              <td>
                {row.changes.length === 0
                  ? "—"
                  : row.changes.map((change) => change.field).join(", ")}
              </td>
            </tr>

            {expandedRow === row.rowNumber && (
              <tr>
                <td colSpan={4} className="bg-gray-50 p-4">
                  <div className="space-y-4">
                    {row.changes.length === 0 ? (
                      <p className="text-gray-500">No changes.</p>
                    ) : (
                      row.changes.map((change) => (
                        <div key={change.field} className="rounded border p-3">
                          <div className="mb-2 font-semibold">
                            {change.field}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="mb-1 text-xs text-gray-500">
                                Old
                              </div>
                              <div className="rounded bg-red-50 p-2">
                                {String(change.oldValue ?? "—")}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-xs text-gray-500">
                                New
                              </div>
                              <div className="rounded bg-green-50 p-2">
                                {String(change.newValue ?? "—")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
