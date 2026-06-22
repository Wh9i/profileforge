"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }
    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.message) {
          setStatus("success");
          setMessage(json.message);
        } else {
          setStatus("error");
          setMessage(json.error);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed");
      });
  }, [token]);

  return (
    <Card glow className="text-center py-8">
      {status === "loading" && (
        <div className="animate-pulse text-white/50">Verifying your email...</div>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-green-400 mb-6">{message}</p>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-red-400 mb-6">{message}</p>
          <Link href="/register"><Button variant="secondary">Register Again</Button></Link>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Email Verification</h1>
        </div>
        <Suspense fallback={<Card><div className="h-32 animate-pulse bg-white/5 rounded-xl" /></Card>}>
          <VerifyContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
