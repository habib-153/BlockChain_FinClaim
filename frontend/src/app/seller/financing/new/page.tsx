import { SubmitClaimForm } from "@/components/claim/SubmitClaimForm";

export default function RequestFinancingPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Request more financing</h1>
        <p className="text-sm text-muted-foreground">
          Request additional financing from another bank against one of your
          already-attested receivables.
        </p>
      </div>
      <SubmitClaimForm />
    </div>
  );
}
