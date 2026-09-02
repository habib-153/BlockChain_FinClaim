import { SubmitReceivableForm } from "@/components/receivable/SubmitReceivableForm";

export default function NewReceivablePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Submit a receivable</h1>
        <p className="text-sm text-muted-foreground">
          Register a new invoice for buyer attestation and lender financing.
        </p>
      </div>
      <SubmitReceivableForm />
    </div>
  );
}
