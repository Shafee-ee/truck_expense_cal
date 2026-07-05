"use client";

import { useMemo } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

export default function CompanyCombobox({
  companies,
  selectedCompany,
  onChange,
  companyName,
  setCompanyName,
}) {
  const query = companyName;
  const filteredCompanies = useMemo(() => {
    if (!query) return companies;

    return companies.filter((company) =>
      company.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [companies, query]);

  return (
    <Combobox
      value={selectedCompany}
      onChange={(company) => {
        onChange(company);

        if (company) {
          setCompanyName(company.name);
        }
      }}
    >
      <div className="relative">
        <ComboboxInput
          className="w-full rounded-sm border p-2"
          displayValue={() => companyName}
          onChange={(event) => {
            setCompanyName(event.target.value);
            onChange(null);
          }}
          placeholder="Search or type a company..."
        />

        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow">
          {filteredCompanies.map((company) => (
            <ComboboxOption
              key={company.id}
              value={company}
              className="cursor-pointer px-3 py-2 data-[focus]:bg-blue-100"
            >
              {company.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
