import { SubmitReceivableForm } from "@/components/receivable/SubmitReceivableForm";

export default function NewReceivablePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">New financing application</h1>
        <p className="text-sm text-muted-foreground">
          Register a new invoice and request financing from a specific bank -
          the request is evaluated once the buyer attests the invoice.
        </p>
      </div>
      <SubmitReceivableForm />
    </div>
  );
}
