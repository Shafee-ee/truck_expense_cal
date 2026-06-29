"use client";

export default function EditTruckForm({ truck }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Vehicle Number</label>

        <input
          type="text"
          name="numberPlate"
          defaultValue={truck.numberPlate}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Vehicle Type</label>

        <select
          name="vehicleType"
          defaultValue={truck.vehicleType}
          className="border p-2 w-full"
        >
          <option value="TRUCK">Truck</option>
          <option value="TEMPO">Tempo</option>
          <option value="CAR">Car</option>
        </select>
      </div>

      <button className="bg-black text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
}
