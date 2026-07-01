"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";

const COMPLIANCE_CATEGORIES = [
  "INSURANCE",
  "ROAD_TAX",
  "PERMIT",
  "NATIONAL_PERMIT",
  "FITNESS",
];

export default function TruckExpenseForm({ trucks, action }) {
  const [category, setCategory] = useState("");

  const showExpiryDate = COMPLIANCE_CATEGORIES.includes(category);

  return (
    <form action={action} className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Truck</label>

        <select name="truckId" className="border rounded p-2 w-full" required>
          <option value="">Select Truck</option>

          {trucks.map((truck) => (
            <option key={truck.id} value={truck.id}>
              {truck.numberPlate}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>

        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
          required
        >
          <option value="">Select Category</option>

          <option value="TYRE">Tyre</option>
          <option value="REPAIR">Repair</option>
          <option value="ELECTRICAL">Electrical</option>

          <option value="INSURANCE">Insurance</option>
          <option value="ROAD_TAX">Road Tax</option>
          <option value="PERMIT">Permit</option>
          <option value="NATIONAL_PERMIT">National Permit</option>
          <option value="FITNESS">Fitness</option>

          <option value="SALARY">Salary</option>
          <option value="WASHING">Washing</option>
          <option value="ADD_BLUE">AdBlue</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount (₹)</label>

        <input
          name="amount"
          type="number"
          step="0.01"
          className="border rounded p-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Vendor</label>

        <input
          name="vendor"
          type="text"
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Expense Date</label>

        <input
          name="expenseDate"
          type="date"
          className="border rounded p-2 w-full"
          required
        />
      </div>

      {showExpiryDate ? (
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>

          <input
            name="expiryDate"
            type="date"
            className="border rounded p-2 w-full"
          />
        </div>
      ) : (
        <div />
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Note</label>

        <input name="note" type="text" className="border rounded p-2 w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {showExpiryDate ? "Certificate" : "Invoice / Bill"}
        </label>

        <FileUpload />
      </div>

      <button className="col-span-2 rounded bg-black p-2 text-white">
        Add Expense
      </button>
    </form>
  );
}
