"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FullscreenLoader } from "@/components/shared/fullscreen-loader";

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

interface LoginResponse {
  user?: { role: string; name: string };
  redirectTo?: string;
  error?: { message: string };
}

type Tab = "citizen" | "officer";

/**
 * One column, one job. The tab decides what the single field asks for, and the
 * citizen side grows a second field once the code is on its way.
 */
export function LoginCard() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("return");

  const [tab, setTab] = useState<Tab>("citizen");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const citizen = tab === "citizen";

  function pick(next: Tab) {
    setTab(next);
    setOtpRequested(false);
    setOtp("");
  }

  /** The API wants an E.164 number; the field asks for the ten digits people know. */
  const e164 = () => `+91${phone.replace(/\D/g, "").slice(-10)}`;

  async function requestOtp() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: e164() }),
      });
      const data = (await res.json()) as { devOtp?: string; error?: { message: string } };
      if (!res.ok) {
        toast.error(data.error?.message ?? "Couldn't send the code.");
        return;
      }
      setOtpRequested(true);
      if (data.devOtp) {
        setOtp(data.devOtp);
        toast.info(`Demo code: ${data.devOtp}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submit(body: Record<string, string>) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as LoginResponse;
      if (!res.ok) {
        toast.error(data.error?.message ?? "Sign in failed.");
        return;
      }
      toast.success(`Welcome, ${data.user?.name ?? "back"}.`);
      setNavigating(true);
      router.push(returnTo ?? data.redirectTo ?? "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const digits = phone.replace(/\D/g, "").length;
  const ready = citizen
    ? otpRequested
      ? otp.length === 6
      : digits === 10
    : Boolean(email && password);

  /**
   * The button stays live and names what is missing. A greyed-out primary
   * action that will not say why is the harder thing to recover from.
   */
  function go() {
    if (!citizen) {
      if (!email) return toast.error("Enter the work email issued by your department.");
      if (!password) return toast.error("Enter your password.");
      return submit({ email, password });
    }
    if (!otpRequested) {
      if (digits !== 10) return toast.error("Enter your 10-digit mobile number.");
      return requestOtp();
    }
    if (otp.length !== 6) return toast.error("Enter the six digits we texted you.");
    return submit({ phone: e164(), otp });
  }

  return (
    <>
      {navigating && <FullscreenLoader label="Signing you in…" />}
      <div className="logincard fadeup" style={{ animationDelay: ".12s" }}>
        <h1>Sign in</h1>
        <p className="sub">
          Track every civic complaint like a service journey — a named officer and
          a running clock.
        </p>

        <div className="tabs2" role="tablist">
          <button role="tab" aria-selected={citizen} onClick={() => pick("citizen")}>
            Citizen
          </button>
          <button role="tab" aria-selected={!citizen} onClick={() => pick("officer")}>
            Officer / Admin
          </button>
        </div>

        <div className="flabel">{citizen ? "Mobile number" : "Work email"}</div>
        <div className="field2">
          {citizen && <span className="cc">+91</span>}
          {citizen ? (
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              aria-label="Mobile number"
              value={phone}
              maxLength={11}
              disabled={otpRequested}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ready && go()}
            />
          ) : (
            <input
              type="email"
              autoComplete="email"
              placeholder="name@amc.tripura.gov.in"
              aria-label="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </div>

        {citizen && otpRequested && (
          <>
            <div className="flabel">Six-digit code</div>
            <div className="field2">
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                aria-label="Six-digit code"
                maxLength={6}
                value={otp}
                autoFocus
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && ready && go()}
              />
            </div>
          </>
        )}

        {!citizen && (
          <>
            <div className="flabel">Password</div>
            <div className="field2">
              <input
                type="password"
                autoComplete="current-password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ready && go()}
              />
            </div>
          </>
        )}

        <button className="gobtn" onClick={go} disabled={loading} aria-disabled={!ready}>
          <span>
            {loading
              ? "One moment…"
              : citizen
                ? otpRequested
                  ? "Verify and continue"
                  : "Send code"
                : "Continue"}
          </span>
          <Arrow />
        </button>

        <p className="hint2">
          {citizen ? (
            <>
              We&rsquo;ll text a six-digit code. Your number tracks your complaints
              and is <b>never shown publicly</b>.
            </>
          ) : (
            <>Use the address issued by your department. Access is tied to your ward and role.</>
          )}
        </p>
      </div>
    </>
  );
}
