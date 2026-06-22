"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { z } from "zod";

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setMessage(json.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-white/50 mt-2">We&apos;ll send you a reset link</p>
        </div>
        <Card glow>
          {message ? (
            <p className="text-center text-green-400">{message}</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
              <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
