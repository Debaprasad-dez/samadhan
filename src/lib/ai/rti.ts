import { callJSON } from "@/lib/ai/client";
import { rtiDrafter } from "@/lib/ai/prompts";
import { RtiDraftOutput } from "@/schemas/ai";

export interface RtiInput {
  number: string;
  createdAt: string;
  department: string;
  title: string;
  body: string;
  daysSince: number;
}

function fallbackLetter(i: RtiInput): string {
  return `To,
The Public Information Officer,
${i.department} Department,
Municipal Corporation of Greater Mumbai (MCGM),
Mumbai.

Subject: Request for information under the Right to Information Act, 2005 — Complaint ${i.number}

Respected Sir/Madam,

I had filed a complaint (Ref: ${i.number}) on ${i.createdAt} regarding: ${i.title}. ${i.body}

As ${i.daysSince} days have elapsed without resolution, I seek the following information under Section 6 of the RTI Act, 2005:

1. The current status of the above complaint and the action taken to date.
2. The name and designation of the officer(s) responsible for its resolution.
3. The reasons for the delay beyond the stipulated service standard.
4. The expected date by which the matter will be resolved.

Declaration: I am a citizen of India. The requisite application fee is enclosed.

Yours faithfully,
____________________
(Signature)
Name: ____________
Address: ____________
Date: ____________`;
}

export async function draftRti(input: RtiInput) {
  return callJSON({
    version: rtiDrafter.version,
    system: rtiDrafter.system,
    user: rtiDrafter.user(input),
    schema: RtiDraftOutput,
    fallback: { draft: fallbackLetter(input) },
    temperature: 0.3,
  });
}
