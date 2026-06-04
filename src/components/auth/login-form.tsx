"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginResponse {
  user?: { role: string; name: string };
  redirectTo?: string;
  error?: { message: string };
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("return");

  // Citizen OTP state
  const [phone, setPhone] = useState("+919999900001");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  // Officer/Admin state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  function go(redirectTo: string | undefined) {
    const dest = returnTo ?? redirectTo ?? "/";
    router.push(dest);
    router.refresh();
  }

  async function requestOtp() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { ok?: boolean; devOtp?: string } & {
        error?: { message: string };
      };
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
      go(data.redirectTo);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-elev-2">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          Sign in to Samadhan
        </CardTitle>
        <CardDescription>
          Track every civic complaint like a service journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="citizen">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="citizen">Citizen</TabsTrigger>
            <TabsTrigger value="officer">Officer / Admin</TabsTrigger>
          </TabsList>

          {/* Citizen OTP */}
          <TabsContent value="citizen" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="+91XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpRequested}
                autoComplete="tel"
              />
            </div>

            {otpRequested && (
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoComplete="one-time-code"
                />
              </div>
            )}

            {!otpRequested ? (
              <Button
                className="w-full"
                onClick={requestOtp}
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin" />}
                Send code
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => submit({ phone, otp })}
                disabled={loading || otp.length !== 6}
              >
                {loading && <Loader2 className="animate-spin" />}
                Verify &amp; continue
              </Button>
            )}
            <p className="text-muted-foreground text-xs">
              Demo: phone <span className="font-mono">+919999900001</span>, code{" "}
              <span className="font-mono">123456</span>.
            </p>
          </TabsContent>

          {/* Officer / Admin password */}
          <TabsContent value="officer" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@mcgm.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => submit({ email, password })}
              disabled={loading || !email || !password}
            >
              {loading && <Loader2 className="animate-spin" />}
              Sign in
            </Button>
            <p className="text-muted-foreground text-xs">
              Demo officer: <span className="font-mono">rajesh@mcgm.gov.in</span>{" "}
              / <span className="font-mono">Officer@123!demo</span>
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
