"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { z } from "zod";

type ResetInput = z.infer<typeof resetPasswordSchema>;

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetInput) => {
    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      setLoading(false);
      return;
    }
    router.push("/login?reset=true");
  };

  return (
    <Card glow>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <Input label="New Password" type="password" error={errors.password?.message} {...register("password")} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">New password</h1>
        </div>
        <Suspense fallback={<Card><div className="h-32 animate-pulse bg-white/5 rounded-xl" /></Card>}>
          <ResetForm />
        </Suspense>
        <p className="text-center text-sm text-white/40 mt-6">
          <Link href="/login" className="text-brand-400">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
