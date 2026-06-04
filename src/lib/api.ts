import { NextResponse } from "next/server";

/** Typed success JSON response. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Standard error envelope (§3.4): { error: { code, message, details? } }. */
export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

/** Map a ZodError into a 400 with field details. */
export function failValidation(details: unknown): NextResponse {
  return fail("VALIDATION", "Some fields need attention.", 400, details);
}
