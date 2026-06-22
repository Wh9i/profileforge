"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap, Globe, BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    tier: "FREE",
    features: [
      "Basic profile customization",
      "1 music track",
      "5 uploads",
      "Basic analytics",
      "Standard effects",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/mo",
    tier: "PRO",
    features: [
      "All customization options",
      "10 music tracks",
      "50 uploads",
      "Advanced analytics",
      "Premium badge",
      "Neon & glow effects",
      "Animated username",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$12",
    period: "/mo",
    tier: "ELITE",
    features: [
      "Everything in Pro",
      "Unlimited music tracks",
      "Unlimited uploads",
      "Custom domain",
      "Priority support",
      "Matrix & particle effects",
      "Exclusive themes",
    ],
    cta: "Upgrade to Elite",
    highlighted: false,
  },
];

export default function PremiumPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-amber-400 mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold">Unlock your full potential</h1>
          <p className="text-white/50 mt-2">
            Get more effects, uploads, analytics, and exclusive features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                glow={plan.highlighted}
                className={`h-full flex flex-col ${
                  plan.highlighted ? "border-brand-500/30" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-medium text-brand-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full"
                  disabled={plan.tier === "FREE"}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Zap, title: "More Effects", desc: "Unlock premium visual effects" },
            { icon: Globe, title: "Custom Domain", desc: "Use your own domain name" },
            { icon: BarChart3, title: "Advanced Analytics", desc: "Deep insights into visitors" },
          ].map((item) => (
            <div key={item.title} className="text-center glass rounded-2xl p-6">
              <item.icon className="w-6 h-6 text-brand-400 mx-auto mb-3" />
              <h4 className="font-medium text-sm">{item.title}</h4>
              <p className="text-xs text-white/40 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
