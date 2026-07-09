"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import CompanyComboBox from "./CompanyComboBox";

import { updateSettlement } from "@/app/trips/[id]/actions";
export default function SettlementForm({ trip, companies }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const [selectedTransporter, setSelectedTransporter] = useState(
    trip.transporterCompany || null
  );

  const [transporterCompany, setTransporterCompany] = useState(
    trip.transporterCompany?.name || ""
  );

  const [selectedClient, setSelectedClient] = useState(
    trip.clientCompany || null
  );

  const [clientCompany, setClientCompany] = useState(
    trip.clientCompany?.name || ""
  );

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await updateSettlement(trip.id, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Settlement updated");
      setIsEditing(false);
    });
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="
            rounded-lg
            border
            border-amber-300
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-amber-800
            hover:bg-amber-100
          "
          >
            Edit Settlement
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Client</p>
            <p className="font-semibold text-zinc-800">
              {trip.clientCompany?.name || "-"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Bill Number</p>
            <p className="font-semibold text-zinc-800">
              {trip.billNumber || "-"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Gross Amount</p>
            <p className="font-semibold text-zinc-800">
              ₹{trip.grossAmount?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Customer Diesel</p>
            <p className="font-semibold text-zinc-800">
              ₹{trip.customerDiesel?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Customer Advance</p>
            <p className="font-semibold text-zinc-800">
              ₹{trip.customerAdvance?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">GC Balance</p>
            <p className="font-semibold text-emerald-700">
              ₹{trip.gcBalance?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">TDS</p>

            <p className="font-semibold text-zinc-800">
              ₹{trip.tds?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Charges</p>

            <p className="font-semibold text-zinc-800">
              ₹{trip.charges?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Damage Amount</p>

            <p className="font-semibold text-zinc-800">
              ₹{trip.damageAmount?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div>
            <p className="text-zinc-500">Commission / Tonne</p>

            <p className="font-semibold text-zinc-800">
              ₹{trip.commissionPerTonne?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        {trip.loadType === "EXTERNAL" && (
          <>
            <hr className="my-6" />

            <h3 className="text-lg font-semibold text-slate-800">
              Transporter Settlement
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
              <div>
                <p className="text-zinc-500">Transporter</p>
                <p className="font-semibold text-zinc-800">
                  {trip.transporterCompany?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Transporter Freight</p>
                <p className="font-semibold text-zinc-800">
                  ₹{trip.transporterFreight?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Advance Paid</p>
                <p className="font-semibold text-zinc-800">
                  ₹{trip.transporterAdvance?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Other Charges</p>
                <p className="font-semibold text-zinc-800">
                  ₹{trip.transporterCharges?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Transporter Payable</p>
                <p className="font-semibold text-blue-700">
                  ₹{trip.transporterPayable?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Logisco Commission</p>

                <p className="font-semibold text-emerald-700">
                  ₹
                  {(
                    (Number(trip.estimatedQty) || 0) *
                    (Number(trip.commissionPerTonne) || 0)
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
        Customer Settlement
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Company
          </label>

          <CompanyComboBox
            companies={companies}
            selectedCompany={selectedClient}
            onChange={setSelectedClient}
            companyName={clientCompany}
            setCompanyName={setClientCompany}
          />

          <input
            type="hidden"
            name="clientCompanyId"
            value={selectedClient?.id || ""}
          />

          <input type="hidden" name="clientCompany" value={clientCompany} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bill Number</label>

          <input
            name="billNumber"
            defaultValue={trip.billNumber || ""}
            placeholder="Bill Number"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gross Amount</label>

          <input
            name="grossAmount"
            type="number"
            step="0.01"
            defaultValue={trip.grossAmount || 0}
            placeholder="Gross Amount"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Diesel
          </label>

          <input
            name="customerDiesel"
            type="number"
            step="0.01"
            defaultValue={trip.customerDiesel || 0}
            placeholder="Customer Diesel"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Advance
          </label>

          <input
            name="customerAdvance"
            type="number"
            step="0.01"
            defaultValue={trip.customerAdvance || 0}
            placeholder="Customer Advance"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">TDS</label>

          <input
            name="tds"
            type="number"
            step="0.01"
            defaultValue={trip.tds || 0}
            placeholder="TDS"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Charges</label>

          <input
            name="charges"
            type="number"
            step="0.01"
            defaultValue={trip.charges || 0}
            placeholder="Charges"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Damage Amount
          </label>

          <input
            name="damageAmount"
            type="number"
            step="0.01"
            defaultValue={trip.damageAmount || 0}
            placeholder="Damage Amount"
            className="border p-2 rounded-lg w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Commission / Tonne
          </label>

          <input
            name="commissionPerTonne"
            type="number"
            step="0.01"
            defaultValue={trip.commissionPerTonne || 0}
            placeholder="Commission per tonne"
            className="border p-2 rounded-lg w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Damage Notes</label>

        <textarea
          name="damageNotes"
          rows={3}
          defaultValue={trip.damageNotes || ""}
          placeholder="Damage Notes"
          className="border p-2 rounded-lg w-full"
        />
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-slate-600">Calculated GC Balance</p>

        <p className="text-2xl font-bold text-emerald-700">
          ₹
          {(
            (Number(trip.grossAmount) || 0) -
            (Number(trip.customerDiesel) || 0) -
            (Number(trip.customerAdvance) || 0) -
            (Number(trip.tds) || 0) -
            (Number(trip.charges) || 0) -
            (Number(trip.damageAmount) || 0)
          ).toLocaleString("en-IN")}
        </p>
      </div>

      {trip.loadType === "EXTERNAL" && (
        <>
          <h3 className="text-lg font-semibold text-slate-800">
            Transporter Settlement
          </h3>
          {/*transporter grid*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Transporter Company
              </label>
              <CompanyComboBox
                companies={companies}
                selectedCompany={selectedTransporter}
                onChange={setSelectedTransporter}
                companyName={transporterCompany}
                setCompanyName={setTransporterCompany}
              />

              <input
                type="hidden"
                name="transporterCompanyId"
                value={selectedTransporter?.id || ""}
              />

              <input
                type="hidden"
                name="transporterCompany"
                value={transporterCompany}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Transporter Freight
              </label>

              <input
                name="transporterFreight"
                type="number"
                step="0.01"
                defaultValue={trip.transporterFreight || 0}
                className="border p-2 rounded-lg w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Advance Paid
              </label>

              <input
                name="transporterAdvance"
                type="number"
                step="0.01"
                defaultValue={trip.transporterAdvance || 0}
                className="border p-2 rounded-lg w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Other Charges
              </label>

              <input
                name="transporterCharges"
                type="number"
                step="0.01"
                defaultValue={trip.transporterCharges || 0}
                className="border p-2 rounded-lg w-full"
              />
            </div>

            <div className="md:col-span-2 rounded-lg border border-blue-200 bg-white p-4">
              <p className="text-sm text-slate-600">Transporter Payable</p>

              <p className="text-2xl font-bold text-blue-700">
                ₹
                {(
                  (Number(trip.transporterFreight) || 0) -
                  (Number(trip.transporterAdvance) || 0) -
                  (Number(trip.transporterCharges) || 0)
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </>
      )}
      <button
        disabled={isPending}
        className="
        bg-black
        text-white
        px-4
        py-2
        rounded-lg
        disabled:opacity-50
      "
      >
        {isPending ? "Saving..." : "Save Settlement"}
      </button>
    </form>
  );
}
