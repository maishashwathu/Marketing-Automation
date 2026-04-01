import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Globe,
  Brain,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart2,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Business DNA",
    description:
      "We analyze your site to extract your brand voice, audience, and unique positioning.",
  },
  {
    icon: FileText,
    title: "Content Calendar",
    description:
      "AI generates a full month of on-brand posts, captions, and copy — ready to publish.",
  },
  {
    icon: Sparkles,
    title: "Caption Generator",
    description:
      "Craft platform-perfect captions for Instagram, LinkedIn, X, and more in one click.",
  },
  {
    icon: BarChart2,
    title: "Ad Insights",
    description:
      "Get data-driven ad copy and audience targeting suggestions powered by Gemini AI.",
  },
];

const testimonials = [
  {
    quote:
      "MarketAI saved our team 20 hours a week. It knows our brand better than we do.",
    author: "Sofia R.",
    role: "Head of Marketing, Bloom Studio",
  },
  {
    quote:
      "I entered our URL and had a full content calendar in under 60 seconds. Wild.",
    author: "James T.",
    role: "Founder, ThreadBase",
  },
  {
    quote:
      "The ad copy it generates converts 3× better than what we were writing manually.",
    author: "Priya K.",
    role: "Growth Lead, Kova Labs",
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [, navigate] = useLocation();

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    const id = encodeURIComponent(url.trim());
    navigate(`/dashboard/${id}`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5 text-primary" />
            MarketAI
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Features
            </Button>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-6 px-4 py-1.5 text-sm">
            Autonomous AI Marketing Platform
          </Badge>
          <h1 className="text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Your entire marketing team,{" "}
            <span className="text-primary">powered by AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Enter your website URL. In seconds, MarketAI learns your brand and
            builds your content calendar, captions, and ad strategy — on
            autopilot.
          </p>

          {/* URL INPUT FORM */}
          <form
            onSubmit={handleAnalyze}
            className="flex items-center gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter your Business Website URL…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-11 text-base"
                required
              />
            </div>
            <Button type="submit" size="lg" className="h-11 gap-2 shrink-0">
              Analyze
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            No credit card required · Results in under 60 seconds
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-6 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              One platform to analyze, create, and optimize your entire
              marketing presence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{f.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {f.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto">
            Three steps from zero to a full marketing strategy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter your URL",
                desc: "Paste your business website. Firecrawl reads every page.",
              },
              {
                step: "02",
                title: "AI analyzes your brand",
                desc: "Gemini 1.5 Flash extracts your DNA — tone, audience, USPs.",
              },
              {
                step: "03",
                title: "Get your strategy",
                desc: "Receive a full content calendar, captions, and ad insights.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by growth teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.author} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground italic mb-4">
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to grow on autopilot?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of founders and marketers using AI to 10× their
            content output.
          </p>
          <form
            onSubmit={handleAnalyze}
            className="flex items-center gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="yourbusiness.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 shrink-0">
              Analyze Free
            </Button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Zap className="h-4 w-4 text-primary" />
            MarketAI
          </div>
          <p>© 2025 MarketAI · Built with Gemini, Firecrawl & Firebase</p>
        </div>
      </footer>
    </div>
  );
}
