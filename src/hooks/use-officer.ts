"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CaseStatus, Severity } from "@/types";

export interface InboxItem {
  id: string;
  number: string;
  title: string;
  status: CaseStatus;
  severity: Severity;
  wardCode: string;
  createdAt: string;
  slaDueAt: string;
  escalated: boolean;
  assignedToId: string | null;
  rank: number;
  _count: { cosigns: number; upvotes: number };
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Request failed.");
  return data as T;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Request failed.");
  return data as T;
}

export function useInbox(params: { status?: string; severity?: string }) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.severity) qs.set("severity", params.severity);
  qs.set("limit", "50");
  return useQuery({
    queryKey: ["inbox", params.status ?? "open", params.severity ?? "all"],
    queryFn: () =>
      getJSON<{ cases: InboxItem[]; total: number }>(
        `/api/officer/inbox?${qs.toString()}`,
      ),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useCaseEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string;
      status: CaseStatus;
      message?: string;
    }) =>
      postJSON(`/api/cases/${v.id}/events`, {
        status: v.status,
        message: v.message,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
      qc.invalidateQueries({ queryKey: ["case"] });
    },
  });
}

export function useCloseCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string;
      closureNote: string;
      afterEvidenceUrl?: string;
    }) =>
      postJSON<{
        quality: { score: number; isBoilerplate: boolean; reasoning: string };
      }>(`/api/cases/${v.id}/close`, {
        closureNote: v.closureNote,
        afterEvidenceUrl: v.afterEvidenceUrl,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
      qc.invalidateQueries({ queryKey: ["case"] });
    },
  });
}

export function useRequestInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; question: string }) =>
      postJSON(`/api/cases/${v.id}/request-info`, { question: v.question }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inbox"] }),
  });
}

export function useReassign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; toUserId: string; reason: string }) =>
      postJSON(`/api/cases/${v.id}/reassign`, {
        toUserId: v.toUserId,
        reason: v.reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
      qc.invalidateQueries({ queryKey: ["case"] });
    },
  });
}

export function useSummary() {
  return useMutation({
    mutationFn: (caseId: string) =>
      postJSON<{ summary: string; fallback: boolean }>("/api/ai/summarise", {
        caseId,
      }),
  });
}
