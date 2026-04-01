import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Brain,
  CalendarDays,
  Sparkles,
  BarChart2,
  Settings,
  Home,
  ChevronRight,
  Loader2,
  Globe,
  Users,
  Megaphone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  PartyPopper,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessDNA {
  businessName: string;
  targetAudience: string;
  brandTone: string;
  contentPillars: string[];
}

interface CalendarPost {
  day: number;
  date: string;
  dayName: string;
  platform: string;
  pillar: string;
  postIdea: string;
  caption: string;
  festival?: string | null;
  festivalAngle?: string | null;
}

interface PlatformCaptions {
  Instagram: string;
  LinkedIn: string;
  X: string;
  Facebook: string;
}

interface StrategyInsight {
  title: string;
  insight: string;
  action: string;
}

interface FullPlan {
  dna: BusinessDNA;
  calendar: CalendarPost[];
  platformCaptions: Record<string, PlatformCaptions>;
  strategyInsights: StrategyInsight[];
}

type BusinessStatus = "pending" | "analyzing" | "done" | "error";

interface BusinessDoc {
  url?: string;
  status: BusinessStatus;
  plan?: FullPlan;
  dna?: BusinessDNA;
  errorMessage?: string;
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems = [
  { icon: Home,        label: "Overview",          id: "overview" },
  { icon: Brain,       label: "Business DNA",       id: "dna" },
  { icon: CalendarDays,label: "Content Calendar",   id: "calendar" },
  { icon: Sparkles,    label: "Caption Generator",  id: "captions" },
  { icon: BarChart2,   label: "Strategy & Insights",id: "ads" },
];

// ── Platform colours ──────────────────────────────────────────────────────────

const PLATFORM_COLOR: Record<string, string> = {
  Instagram: "bg-pink-500",
  LinkedIn:  "bg-blue-600",
  X:         "bg-zinc-800",
  Facebook:  "bg-blue-500",
};

const PLATFORM_EMOJI: Record<string, string> = {
  Instagram: "📸",
  LinkedIn:  "💼",
  X:         "𝕏",
  Facebook:  "👥",
};

// ── Section wrapper ───────────────────────────────────────────────────────────

type SectionProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
};

function DashboardSection({ icon: Icon, title, description, badge, children }: SectionProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            </div>
          </div>
          {badge && (
            <Badge variant="secondary" className="shrink-0 text-xs">{badge}</Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {children ?? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Generating your plan…</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Business DNA ──────────────────────────────────────────────────────────────

function BusinessDNAContent({ dna }: { dna: BusinessDNA }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
          <Zap className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Business Name</p>
          <p className="text-sm font-semibold">{dna.businessName}</p>
        </div>
      </div>

      <Separator />

      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
          <Users className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Target Audience</p>
          <p className="text-sm leading-relaxed">{dna.targetAudience}</p>
        </div>
      </div>

      <Separator />

      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
          <Megaphone className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Brand Tone</p>
          <p className="text-sm leading-relaxed">{dna.brandTone}</p>
        </div>
      </div>

      {Array.isArray(dna.contentPillars) && dna.contentPillars.length > 0 && (
        <>
          <Separator />
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Content Pillars</p>
              <ul className="space-y-1.5">
                {dna.contentPillars.map((pillar, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleCopy}>
      {copied ? (
        <><Check className="h-3.5 w-3.5 text-green-500" /><span className="text-green-600 text-xs">Copied!</span></>
      ) : (
        <><Copy className="h-3.5 w-3.5" /><span className="text-xs">Copy</span></>
      )}
    </Button>
  );
}

// ── Post card (AI-generated) ──────────────────────────────────────────────────

function PostCard({ post }: { post: CalendarPost }) {
  const [expanded, setExpanded] = useState(false);
  const color = PLATFORM_COLOR[post.platform] ?? "bg-zinc-600";

  return (
    <div className="rounded-xl border overflow-hidden bg-card shadow-sm">
      {/* Header strip */}
      <div className={`${color} px-3 py-2 flex items-center justify-between`}>
        <span className="text-[11px] font-bold text-white">{post.platform}</span>
        <span className="text-[10px] text-white/80 font-medium">{post.dayName} · {post.date}</span>
      </div>

      {/* Festival badge */}
      {post.festival && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center gap-1.5">
          <PartyPopper className="h-3 w-3 text-amber-600 shrink-0" />
          <span className="text-[10px] font-semibold text-amber-700">{post.festival}</span>
          {post.festivalAngle && (
            <span className="text-[10px] text-amber-600 truncate">· {post.festivalAngle}</span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Pillar tag */}
        <span className="inline-block text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {post.pillar}
        </span>

        {/* Post idea */}
        <p className="text-xs font-semibold text-foreground leading-snug">{post.postIdea}</p>

        {/* Caption */}
        <p className={`text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}>
          {post.caption}
        </p>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[10px] text-primary font-medium hover:underline"
          >
            {expanded ? "Show less" : "Read full caption"}
          </button>
          <CopyButton text={post.caption} />
        </div>
      </div>
    </div>
  );
}

// ── Content Calendar ──────────────────────────────────────────────────────────

function ContentCalendarContent({ plan }: { plan: FullPlan }) {
  const [week, setWeek] = useState(1);
  const calendar = plan.calendar;

  const weeks: CalendarPost[][] = [1, 2, 3, 4].map((w) =>
    calendar.filter((_, i) => Math.floor(i / 7) + 1 === w)
  );

  const festivalCount = calendar.filter((p) => p.festival).length;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <span className="font-medium text-foreground">{calendar.length} posts planned</span>
        <span>·</span>
        <span>{festivalCount} festival-tied posts</span>
        <span>·</span>
        <span>4 platforms covered</span>
      </div>

      <Tabs value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
        <TabsList className="w-full">
          {[1, 2, 3, 4].map((w) => {
            const hasFestival = weeks[w - 1]?.some((p) => p.festival);
            return (
              <TabsTrigger key={w} value={String(w)} className="flex-1 text-xs gap-1">
                Week {w}{hasFestival && <PartyPopper className="h-3 w-3 text-amber-500" />}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {weeks.map((posts, wi) => (
          <TabsContent key={wi} value={String(wi + 1)} className="mt-3">
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post, i) => (
                <PostCard key={i} post={post} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <p className="text-[11px] text-muted-foreground text-center">
        28-day AI-generated schedule · Content grounded in your website · Powered by Gemini
      </p>
    </div>
  );
}

// ── Caption Generator ─────────────────────────────────────────────────────────

const PLATFORM_TABS: { key: keyof PlatformCaptions; emoji: string; charLimit: string }[] = [
  { key: "Instagram", emoji: "📸", charLimit: "2,200 chars" },
  { key: "LinkedIn",  emoji: "💼", charLimit: "3,000 chars" },
  { key: "X",         emoji: "𝕏",  charLimit: "280 chars"   },
  { key: "Facebook",  emoji: "👥", charLimit: "63,206 chars" },
];

function CaptionGeneratorContent({ plan }: { plan: FullPlan }) {
  const pillars = plan.dna.contentPillars;
  const [selectedPillar, setSelectedPillar] = useState(pillars[0]);
  const captions = plan.platformCaptions[selectedPillar];

  return (
    <div className="space-y-4">
      {/* Pillar selector */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          Content Theme
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pillars.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPillar(p)}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                selectedPillar === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Platform caption tabs */}
      {captions ? (
        <Tabs defaultValue="Instagram">
          <TabsList className="w-full">
            {PLATFORM_TABS.map(({ key, emoji }) => (
              <TabsTrigger key={key} value={key} className="flex-1 text-xs gap-1">
                <span>{emoji}</span>
                <span className="hidden sm:inline">{key}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {PLATFORM_TABS.map(({ key, charLimit }) => {
            const caption = captions[key] ?? "";
            return (
              <TabsContent key={key} value={key} className="mt-3">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold">
                        {PLATFORM_EMOJI[key]} {key} Caption
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Limit: {charLimit} · Theme: {selectedPillar}
                      </p>
                    </div>
                    <CopyButton text={caption} />
                  </div>
                  <Separator className="mb-2" />
                  <pre className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans">
                    {caption}
                  </pre>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div className="rounded-lg border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          No captions available for this theme yet.
        </div>
      )}
    </div>
  );
}

// ── Strategy & Insights ───────────────────────────────────────────────────────

function StrategyContent({ plan }: { plan: FullPlan }) {
  const insights = plan.strategyInsights ?? [];
  const calendar = plan.calendar ?? [];

  const platformCounts: Record<string, number> = {};
  calendar.forEach((p) => {
    platformCounts[p.platform] = (platformCounts[p.platform] ?? 0) + 1;
  });

  const festivals = calendar.filter((p) => p.festival);

  return (
    <div className="space-y-6">
      {/* Platform distribution */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Your posting schedule across platforms
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(platformCounts).map(([platform, count]) => (
            <div key={platform} className="rounded-lg bg-muted/60 px-3 py-2.5 text-center">
              <p className="text-lg mb-0.5">{PLATFORM_EMOJI[platform] ?? "📢"}</p>
              <p className="text-xs font-semibold">{platform}</p>
              <p className="text-base font-bold">{count}</p>
              <p className="text-[10px] text-muted-foreground">posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Festival opportunities */}
      {festivals.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Festival & Occasion Posts Planned
            </p>
            <div className="space-y-2">
              {festivals.map((p, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <PartyPopper className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">{p.festival} · {p.date}</p>
                    <p className="text-[11px] text-amber-700">{p.postIdea}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* AI Strategy insights */}
      {insights.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              AI Strategy Insights for Your Business
            </p>
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded-md bg-primary/15">
                      <Lightbulb className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-primary">{insight.title}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground mb-3">{insight.insight}</p>
                  <div className="rounded-md bg-background border px-3 py-2 flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-foreground">{insight.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BusinessStatus | null }) {
  if (!status || status === "pending" || status === "analyzing") {
    return (
      <Badge variant="outline" className="gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Analyzing
      </Badge>
    );
  }
  if (status === "done") {
    return (
      <Badge variant="outline" className="gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Done
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-destructive border-destructive/30">
      <AlertCircle className="h-3 w-3" />
      Error
    </Badge>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = params.id ?? "";

  const [business, setBusiness] = useState<BusinessDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Seed state from sessionStorage immediately (works even without Firestore)
  useEffect(() => {
    if (!id) return;
    try {
      const cached = sessionStorage.getItem(`business_${id}`);
      if (cached) {
        setBusiness(JSON.parse(cached) as BusinessDoc);
        setLoading(false);
      }
    } catch { /* ignore */ }
  }, [id]);

  // Real-time Firestore listener — enhances the session-cached data when available
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "businesses", id);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          const hasCached = Boolean(
            (() => {
              try { return sessionStorage.getItem(`business_${id}`); }
              catch { return null; }
            })()
          );
          if (!hasCached) setNotFound(true);
          setLoading(false);
          return;
        }
        const data = snap.data() as BusinessDoc;
        setBusiness(data);
        setLoading(false);
        setNotFound(false);
        try {
          sessionStorage.setItem(`business_${id}`, JSON.stringify(data));
        } catch { /* ignore */ }
      },
      (err) => {
        console.warn("Firestore onSnapshot error (using cached data):", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  // Resolve plan — prefer the full plan, fall back to dna-only for backward compat
  const plan = business?.plan ?? null;
  const dna = plan?.dna ?? business?.dna ?? null;
  const status = business?.status ?? null;
  const businessUrl = business?.url ?? "";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* SIDEBAR */}
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-2 font-bold text-base">
              <Zap className="h-5 w-5 text-primary" />
              MarketAI
            </div>
            {businessUrl && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-muted rounded-md px-2 py-1.5 overflow-hidden">
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{businessUrl}</span>
              </div>
            )}
            {loading && !businessUrl && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading…
              </div>
            )}
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton isActive={item.id === "overview"} className="gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="gap-2.5 text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP BAR */}
          <header className="border-b px-6 h-14 flex items-center gap-3 shrink-0">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">
                Home
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">
                {dna?.businessName ?? "Dashboard"}
              </span>
            </nav>
            <div className="ml-auto">
              <StatusBadge status={status} />
            </div>
          </header>

          {/* PAGE BODY */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {loading
                  ? "Loading…"
                  : dna?.businessName
                    ? `${dna.businessName} — Marketing Dashboard`
                    : "Marketing Dashboard"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {loading
                  ? "Building your marketing plan…"
                  : businessUrl
                    ? `AI-generated plan for ${businessUrl}`
                    : "Complete your analysis to unlock insights"}
              </p>
            </div>

            {!loading && notFound && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold mb-2">Analysis not found</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  This dashboard ID doesn't exist or may have expired.
                </p>
                <Button onClick={() => navigate("/")}>Start a new analysis</Button>
              </div>
            )}

            {!notFound && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BUSINESS DNA */}
                <DashboardSection
                  icon={Brain}
                  title="Business DNA"
                  description="What your brand is, who it serves, and how it speaks"
                  badge="Step 1"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">Analysing your website…</p>
                    </div>
                  ) : dna ? (
                    <BusinessDNAContent dna={dna} />
                  ) : undefined}
                </DashboardSection>

                {/* CONTENT CALENDAR */}
                <DashboardSection
                  icon={CalendarDays}
                  title="Content Calendar"
                  description="28-day posting plan — specific ideas and ready-to-post captions"
                  badge="Step 2"
                >
                  {plan ? <ContentCalendarContent plan={plan} /> : undefined}
                </DashboardSection>

                {/* CAPTION GENERATOR */}
                <DashboardSection
                  icon={Sparkles}
                  title="Caption Generator"
                  description="AI-written captions for Instagram, LinkedIn, X and Facebook"
                  badge="Step 3"
                >
                  {plan ? <CaptionGeneratorContent plan={plan} /> : undefined}
                </DashboardSection>

                {/* STRATEGY & INSIGHTS */}
                <DashboardSection
                  icon={BarChart2}
                  title="Strategy & Insights"
                  description="AI recommendations and festival opportunities for your business"
                  badge="Step 4"
                >
                  {plan ? <StrategyContent plan={plan} /> : undefined}
                </DashboardSection>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
