"use client";

import { useMutation } from "@tanstack/react-query";
import type { Severity } from "@/types";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "AI request failed.");
  }
  return data as T;
}

export interface DraftResult {
  title: string;
  body: string;
  notes: string;
  fallback: boolean;
}

export interface ClassifyResult {
  departmentCode: string;
  categoryId: string;
  severity: Severity;
  confidence: number;
  reasoning?: string;
  fallback: boolean;
}

export interface DuplicateMatch {
  caseId: string;
  title: string;
  similarity: number;
  distanceKm: number;
}

export function useDraft() {
  return useMutation({
    mutationFn: (text: string) => postJSON<DraftResult>("/api/ai/draft", { text }),
  });
}

export function useClassify() {
  return useMutation({
    mutationFn: (v: { title: string; body: string; wardCode?: string }) =>
      postJSON<ClassifyResult>("/api/ai/classify", v),
  });
}

export function useDuplicates() {
  return useMutation({
    mutationFn: (v: { title: string; body: string; wardCode: string }) =>
      postJSON<{ matches: DuplicateMatch[] }>("/api/ai/duplicates", v),
  });
}
