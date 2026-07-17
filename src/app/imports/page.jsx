import ImportCard from "@/components/imports/ImportCard";

const steps = [
  {
    title: "Trip Register",
    description:
      "Import historical trips and automatically discover transport companies.",
    href: "/imports/trips",
    status: "Not Started",
  },
  {
    title: "Fleet Register",
    description:
      "Import trucks and compliance information from the vehicle register.",
    href: "/imports/fleet",
    status: "Waiting",
  },
  {
    title: "Vehicle Maintenance",
    description:
      "Import tyre, repair, electrical and other maintenance history.",
    href: "/imports/maintenance",
    status: "Waiting",
  },
  {
    title: "FASTag Statement",
    description: "Import historical toll transactions from FASTag statements.",
    href: "/imports/fastag",
    status: "Optional",
  },
];

export default function ImportsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Migration Wizard</h1>

        <p className="mt-2 text-gray-500">
          Upload your existing Excel files to migrate historical data into HH
          Trucks.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <ImportCard
            key={step.title}
            step={index + 1}
            title={step.title}
            description={step.description}
            status={step.status}
            href={step.href}
          />

          <ImportSummary
    total={preview.totalRows}
    success={preview.validRows}
    warnings={preview.warningCount}
    errors={preview.errorCount}
/>
        ))}
      </div>
    </main>
  );
}
