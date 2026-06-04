import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Severity } from "@/types";

export interface IntakeEvidence {
  url: string;
  kind: "photo" | "video";
  filename: string;
  sizeBytes: number;
  lat?: number;
  lng?: number;
  takenAt?: string;
}

interface IntakeState {
  step: number; // 1..4
  title: string;
  body: string;
  departmentCode: string;
  categoryId: string;
  severity: Severity;
  wardCode: string;
  confidence: number | null; // AI classify confidence
  aiClassified: boolean;
  isPublic: boolean;
  evidence: IntakeEvidence[];

  setField: <K extends keyof IntakeState>(key: K, value: IntakeState[K]) => void;
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  addEvidence: (e: IntakeEvidence) => void;
  removeEvidence: (url: string) => void;
  reset: () => void;
}

const initial = {
  step: 1,
  title: "",
  body: "",
  departmentCode: "",
  categoryId: "",
  severity: "MEDIUM" as Severity,
  wardCode: "",
  confidence: null,
  aiClassified: false,
  isPublic: true,
  evidence: [] as IntakeEvidence[],
};

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
      ...initial,
      setField: (key, value) => set({ [key]: value } as Partial<IntakeState>),
      setStep: (step) => set({ step: Math.min(4, Math.max(1, step)) }),
      next: () => set((s) => ({ step: Math.min(4, s.step + 1) })),
      prev: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
      addEvidence: (e) =>
        set((s) =>
          s.evidence.some((x) => x.url === e.url)
            ? s
            : { evidence: [...s.evidence, e].slice(0, 5) },
        ),
      removeEvidence: (url) =>
        set((s) => ({ evidence: s.evidence.filter((x) => x.url !== url) })),
      reset: () => set({ ...initial }),
    }),
    {
      name: "samadhan.intake.draft", // §5.1.1
    },
  ),
);
