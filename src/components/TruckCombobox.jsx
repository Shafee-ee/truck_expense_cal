"use client";

import { useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

export default function TruckCombobox({
  trucks,
  selectedTruck,
  onChange,
  truckNumber,
  setTruckNumber,
}) {
  const query = truckNumber.toLowerCase();

  const filteredTrucks = useMemo(() => {
    if (!query) return trucks;

    return trucks.filter((truck) => {
      return (
        truck.numberPlate.toLowerCase().includes(query) ||
        truck.company.name.toLowerCase().includes(query)
      );
    });
  }, [trucks, query]);

  return (
    <Combobox
      value={selectedTruck}
      onChange={(truck) => {
        onChange(truck);

        if (truck) {
          setTruckNumber(truck.numberPlate);
        }
      }}
    >
      <div className="relative">
        <ComboboxInput
          className="w-full rounded-sm border p-2"
          displayValue={() => truckNumber}
          onChange={(e) => {
            setTruckNumber(e.target.value);
            onChange(null);
          }}
          placeholder="Search by truck number or owner..."
        />

        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow bg-white">
          {filteredTrucks.map((truck) => (
            <ComboboxOption
              key={truck.id}
              value={truck}
              className="cursor-pointer px-3 py-2 data-[focus]:bg-blue-100"
            >
              <div>
                <div className="font-medium">{truck.numberPlate}</div>
                <div className="text-xs text-gray-500">
                  {truck.company.name}
                </div>
              </div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
