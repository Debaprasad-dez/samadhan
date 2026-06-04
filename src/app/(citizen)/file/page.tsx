import { Suspense } from "react";
import { IntakeWizard } from "@/components/citizen/intake-wizard";

export default function FilePage() {
  return (
    <Suspense fallback={null}>
      <IntakeWizard />
    </Suspense>
  );
}
