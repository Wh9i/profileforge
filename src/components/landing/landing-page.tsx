"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Palette, BarChart3, Music, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Palette,
    title: "Stunning Customization",
    description: "Glassmorphism, neon effects, particles, custom fonts, and animated backgrounds.",
  },
  {
    icon: Music,
    title: "Background Music",
    description: "Upload MP3s, autoplay, playlists, volume control, and audio visualizer.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Track views, unique visitors, link clicks, countries, and devices.",
  },
  {
    icon: Shield,
    title: "Premium Features",
    description: "Custom domains, animated usernames, premium badges, and advanced effects.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center neon-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">ProfileForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-white/60 mb-8">
              <Zap className="w-4 h-4 text-brand-400" />
              The premium bio link platform
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              Your profile,{" "}
              <span className="gradient-text">reimagined</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create a stunning personal page with music, animations, and deep analytics.
              More powerful and beautiful than anything else out there.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="group">
                  Create Your Profile
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="secondary" size="lg">View Demo</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass rounded-3xl p-2 neon-glow max-w-3xl mx-auto">
              <div className="rounded-2xl bg-gradient-to-br from-brand-500/20 via-purple-500/10 to-pink-500/10 p-8 sm:p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 animate-float" />
                  <div className="text-2xl font-bold gradient-text">@yourname</div>
                  <p className="text-white/50 text-sm">Designer · Creator · Dreamer</p>
                  <div className="flex gap-3 mt-4">
                    {["Discord", "Twitter", "GitHub"].map((platform) => (
                      <div key={platform} className="px-6 py-2.5 rounded-xl glass text-sm hover:bg-white/10 transition-colors cursor-pointer">
                        {platform}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-sm text-white/40">
                    <span>1.2K views</span>
                    <span>342 followers</span>
                    <span>89 likes</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything you need
          </h2>
          <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">
            Built for creators who demand the best. No compromises.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4 group-hover:neon-glow transition-shadow">
                  <feature.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 neon-glow">
          <h2 className="text-3xl font-bold mb-4">Ready to stand out?</h2>
          <p className="text-white/50 mb-8">Join thousands of creators with premium profiles.</p>
          <Link href="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            ProfileForge
          </div>
          <p>&copy; {new Date().getFullYear()} ProfileForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
