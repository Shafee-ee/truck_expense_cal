import ImportCard from "@/components/imports/ImportCard";

const imports = [
  {
    title: "Trip Register",
    description:
      "Import trips and automatically create customers and transport companies.",
    href: "/imports/trips",
  },
  {
    title: "Fleet Register",
    description:
      "Import trucks and compliance information from the fleet register.",
    href: "/imports/fleet",
  },
  {
    title: "Vehicle Maintenance",
    description:
      "Import maintenance history including tyres, repairs and compliance expenses.",
    href: "/imports/maintenance",
  },
];

export default function ImportsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Migration Wizard</h1>

        <p className="mt-2 text-gray-500">
          Import historical Excel data to migrate your existing records into HH
          Trucks.{" "}
        </p>
      </div>

      <div className="space-y-4">
        {imports.map((item, index) => (
          <ImportCard
            key={item.title}
            step={index + 1}
            title={item.title}
            description={item.description}
            href={item.href}
          />
        ))}
      </div>
    </main>
  );
}
