import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, Globe, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Content",
    description: "Generate compelling marketing copy with Gemini 1.5 Flash",
    badge: "Gemini AI",
  },
  {
    icon: Globe,
    title: "Web Intelligence",
    description: "Scrape and analyze competitor sites with Firecrawl",
    badge: "Firecrawl",
  },
  {
    icon: TrendingUp,
    title: "Campaign Analytics",
    description: "Track performance with real-time charts and insights",
    badge: "Recharts",
  },
  {
    icon: Zap,
    title: "Autonomous Execution",
    description: "Let the AI run your campaigns end-to-end automatically",
    badge: "Firebase",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MarketAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">MVP v0.1</Badge>
            <Button variant="outline" size="sm">Sign In</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="text-center mb-16">
          <Badge className="mb-4">Autonomous AI Marketing</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Your Marketing Platform,<br />Powered by AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Generate campaigns, analyze competitors, and drive growth — all on autopilot with Gemini AI and real-time web intelligence.
          </p>
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <Input placeholder="Enter your website URL..." className="flex-1" />
            <Button>Analyze</Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <Badge variant="outline">{feature.badge}</Badge>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Explore feature →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>

      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          AI Marketing Platform · Built with Gemini, Firecrawl, Firebase & Recharts
        </div>
      </footer>
    </div>
  );
}
