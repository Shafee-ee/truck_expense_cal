import CreateCompanyForm from "@/components/CreateCompanyForm";
import { createCompany } from "./actions";

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Company</h1>

      <CreateCompanyForm
        action={createCompany}
        successMessage="Company created successfully"
      />
    </div>
  );
}
