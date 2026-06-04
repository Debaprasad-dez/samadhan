// Shared TS types. These mirror the logical enums from PRD §8.1, which are stored
// as String columns because SQLite (Prisma) does not support native enums.

export const ROLES = ["CITIZEN", "OFFICER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const CASE_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "RESOLVED",
  "ESCALATED",
  "CLOSED",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EVENT_TYPES = [
  "CREATED",
  "ACKNOWLEDGED",
  "STATUS_CHANGED",
  "COMMENT_ADDED",
  "EVIDENCE_ADDED",
  "INFO_REQUESTED",
  "INFO_PROVIDED",
  "RESOLVED",
  "REOPENED",
  "ESCALATED",
  "CLOSED",
  "REASSIGNED",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type AiAssistLevel = "full" | "reduced" | "off";

// Minimal session-safe user shape exposed to the client.
export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  wardCode: string | null;
  departmentCode: string | null;
  reputation: number;
  language: string;
}

// Standard API error envelope (§3.4).
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Reputation tiers (§5.3.1).
export const REPUTATION_TIERS = [
  { name: "Watcher", min: 0, max: 199 },
  { name: "Reporter", min: 200, max: 499 },
  { name: "Advocate", min: 500, max: 999 },
  { name: "Champion", min: 1000, max: 1999 },
  { name: "Civic Patron", min: 2000, max: Infinity },
] as const;

export type ReputationTier = (typeof REPUTATION_TIERS)[number]["name"];
