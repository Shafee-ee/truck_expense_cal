import CreateCompanyForm from "@/components/CreateCompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">New Company</h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CreateCompanyForm />
      </div>
    </div>
  );
}
