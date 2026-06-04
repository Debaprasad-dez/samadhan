"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { CreateCaseInput } from "@/schemas/case";
import type { CaseStatus, Severity } from "@/types";

export interface CaseListItem {
  id: string;
  number: string;
  title: string;
  status: CaseStatus;
  severity: Severity;
  wardCode: string;
  departmentCode: string;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
  escalated: boolean;
  _count: { upvotes: number; cosigns: number };
  evidence: { url: string; kind: string }[];
}

export interface CaseListResponse {
  cases: CaseListItem[];
  total: number;
  page: number;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "Request failed.");
  }
  return data as T;
}

export function useCases(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 10));

  return useQuery({
    queryKey: ["cases", params.status ?? "all", params.page ?? 1],
    queryFn: () => getJSON<CaseListResponse>(`/api/cases?${qs.toString()}`),
    staleTime: 15_000,
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => getJSON<{ case: unknown }>(`/api/cases/${id}`),
    staleTime: 0,
  });
}

export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCaseInput) => {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Could not file complaint.");
      }
      return data.case as { id: string; number: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cases"] }),
  });
}
