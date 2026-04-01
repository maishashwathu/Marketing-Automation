import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessDNA {
  businessName: string;
  targetAudience: string;
  brandTone: string;
  contentPillars: string[];
}

type BusinessStatus = "pending" | "analyzing" | "done" | "error";

interface BusinessDoc {
  url?: string;
  status: BusinessStatus;
  dna?: BusinessDNA;
  errorMessage?: string;
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: Brain, label: "Business DNA", id: "dna" },
  { icon: CalendarDays, label: "Content Calendar", id: "calendar" },
  { icon: Sparkles, label: "Caption Generator", id: "captions" },
  { icon: BarChart2, label: "Ad Insights", id: "ads" },
];

// ── Section wrapper ───────────────────────────────────────────────────────────

type SectionProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
};

function DashboardSection({
  icon: Icon,
  title,
  description,
  badge,
  children,
}: SectionProps) {
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
              <CardDescription className="text-xs mt-0.5">
                {description}
              </CardDescription>
            </div>
          </div>
          {badge && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {badge}
            </Badge>
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
            <p className="text-sm text-muted-foreground">
              Waiting for analysis to complete…
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Run Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Business DNA card content ─────────────────────────────────────────────────

function BusinessDNAContent({ dna }: { dna: BusinessDNA }) {
  return (
    <div className="space-y-5">
      {/* Business Name */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
          <Zap className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
            Business Name
          </p>
          <p className="text-sm font-semibold">{dna.businessName}</p>
        </div>
      </div>

      <Separator />

      {/* Target Audience */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
          <Users className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
            Target Audience
          </p>
          <p className="text-sm leading-relaxed">{dna.targetAudience}</p>
        </div>
      </div>

      <Separator />

      {/* Brand Tone */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
          <Megaphone className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
            Brand Tone
          </p>
          <p className="text-sm leading-relaxed">{dna.brandTone}</p>
        </div>
      </div>

      {/* Content Pillars */}
      {Array.isArray(dna.contentPillars) && dna.contentPillars.length > 0 && (
        <>
          <Separator />
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Content Pillars
              </p>
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

// ── Ad Insights mock data & chart ────────────────────────────────────────────

const AD_DATA = [
  { day: "Apr 1",  ctr: 1.8, roas: 2.1 },
  { day: "Apr 2",  ctr: 2.0, roas: 2.3 },
  { day: "Apr 3",  ctr: 1.7, roas: 2.0 },
  { day: "Apr 4",  ctr: 2.2, roas: 2.5 },
  { day: "Apr 5",  ctr: 2.5, roas: 2.8 },
  { day: "Apr 6",  ctr: 2.1, roas: 2.6 },
  { day: "Apr 7",  ctr: 1.9, roas: 2.4 },
  { day: "Apr 8",  ctr: 2.4, roas: 3.0 },
  { day: "Apr 9",  ctr: 2.7, roas: 3.2 },
  { day: "Apr 10", ctr: 2.6, roas: 3.1 },
  { day: "Apr 11", ctr: 2.3, roas: 2.9 },
  { day: "Apr 12", ctr: 2.8, roas: 3.4 },
  { day: "Apr 13", ctr: 3.0, roas: 3.7 },
  { day: "Apr 14", ctr: 2.9, roas: 3.5 },
  { day: "Apr 15", ctr: 3.1, roas: 3.9 },
  { day: "Apr 16", ctr: 2.5, roas: 3.2 },
  { day: "Apr 17", ctr: 2.2, roas: 2.8 },
  { day: "Apr 18", ctr: 2.7, roas: 3.3 },
  { day: "Apr 19", ctr: 3.2, roas: 4.0 },
  { day: "Apr 20", ctr: 3.4, roas: 4.2 },
  { day: "Apr 21", ctr: 3.1, roas: 3.8 },
  { day: "Apr 22", ctr: 3.5, roas: 4.5 },
  { day: "Apr 23", ctr: 3.8, roas: 4.8 },
  { day: "Apr 24", ctr: 3.6, roas: 4.6 },
  { day: "Apr 25", ctr: 3.3, roas: 4.3 },
  { day: "Apr 26", ctr: 3.7, roas: 4.7 },
  { day: "Apr 27", ctr: 4.0, roas: 5.1 },
  { day: "Apr 28", ctr: 3.9, roas: 5.0 },
  { day: "Apr 29", ctr: 4.2, roas: 5.3 },
  { day: "Apr 30", ctr: 4.5, roas: 5.6 },
];

function AdInsightsContent() {
  return (
    <div className="space-y-6">
      {/* Chart */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          CTR & ROAS — Last 30 Days
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={AD_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={4}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="ctr"
              orientation="left"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 6]}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="roas"
              orientation="right"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}x`}
              domain={[0, 7]}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number, name: string) =>
                name === "ctr" ? [`${value}%`, "CTR"] : [`${value}x`, "ROAS"]
              }
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => (value === "ctr" ? "CTR (%)" : "ROAS (x)")}
            />
            <Line
              yAxisId="ctr"
              type="monotone"
              dataKey="ctr"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="roas"
              type="monotone"
              dataKey="roas"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Separator />

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Avg CTR", value: "3.1%", delta: "+2.7%" },
          { label: "Avg ROAS", value: "3.6x", delta: "+3.5x" },
          { label: "Peak Day", value: "Apr 30", delta: "4.5% CTR" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/60 px-3 py-2.5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">{s.label}</p>
            <p className="text-base font-bold">{s.value}</p>
            <p className="text-xs text-green-500 font-medium">{s.delta}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* AI Recommendation */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-md bg-primary/15">
            <BarChart2 className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            AI Recommendation
          </p>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          Your ROAS has climbed{" "}
          <span className="font-semibold text-green-500">167% month-over-month</span>{" "}
          while CTR has more than doubled. The data suggests your audience targeting
          is resonating strongly in the second half of the month.{" "}
          <span className="font-medium">
            Reallocate 30–40% of your budget from awareness campaigns to retargeting
            ads in the Apr 22–30 window
          </span>{" "}
          — this is when conversion intent peaks. Consider pausing low-performing
          ad sets from Apr 1–7 (CTR &lt; 2%) to free up spend for your top-performing
          creative, which is driving the ROAS spike to 5.6x.
        </p>
      </div>
    </div>
  );
}

// ── Shared platform + calendar helpers ───────────────────────────────────────

const PLATFORMS = [
  { label: "Instagram", color: "bg-pink-500" },
  { label: "LinkedIn",  color: "bg-blue-600" },
  { label: "X",         color: "bg-zinc-800" },
  { label: "Facebook",  color: "bg-blue-500" },
] as const;

type PlatformLabel = typeof PLATFORMS[number]["label"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getPillars(dna: BusinessDNA) {
  return dna.contentPillars?.length
    ? dna.contentPillars
    : ["Brand Story", "Tips & Tutorials", "Customer Spotlights", "Industry News"];
}

function buildCalendar(dna: BusinessDNA) {
  const pillars = getPillars(dna);
  return Array.from({ length: 28 }, (_, i) => ({
    week:     Math.floor(i / 7) + 1,
    day:      DAYS[i % 7],
    date:     `Apr ${i + 1}`,
    pillar:   pillars[i % pillars.length],
    platform: PLATFORMS[i % PLATFORMS.length],
  }));
}

function buildCaption(dna: BusinessDNA, pillar: string, platform: PlatformLabel): string {
  const name     = dna.businessName ?? "our brand";
  const tone     = dna.brandTone?.split(",")[0]?.toLowerCase().trim() ?? "engaging";
  const audience = dna.targetAudience?.split(" ").slice(0, 6).join(" ") ?? "your audience";
  const tag      = `#${name.replace(/\s+/g, "")}`;

  switch (platform) {
    case "Instagram":
      return `✨ ${pillar} — at ${name} we make it happen.\n\nEvery piece of content we create is built around what matters most to ${audience}. This one's for you. 🚀\n\n${tone.charAt(0).toUpperCase() + tone.slice(1)}. On-brand. Always.\n\n${tag} #ContentMarketing #GrowthMindset #SmallBiz`;
    case "LinkedIn":
      return `At ${name}, we focus on ${pillar.toLowerCase()} because that's what moves the needle for ${audience}.\n\nHere's our take: clarity beats volume every time. Brands that know their voice and stick to it are the ones that compound over time.\n\nWhat does ${pillar.toLowerCase()} mean for your business? Drop a thought in the comments. 💡`;
    case "X":
      return `${pillar} isn't a tactic — it's a mindset.\n\n${name} helps ${audience} build it from the ground up.\n\nHere's how we do it 🧵👇\n\n${tag}`;
    case "Facebook":
      return `📣 ${pillar} spotlight!\n\nAt ${name}, we're helping ${audience} get real results through smarter, more intentional marketing.\n\nThis week we're focusing on ${pillar.toLowerCase()} — and the response has been incredible. 🎯\n\n👉 Save this post and share it with someone who needs to hear it!`;
  }
}

// ── Image fetching hook ───────────────────────────────────────────────────────

interface UnsplashImage {
  id: string;
  url: string;
  small: string;
  thumb: string;
  alt: string;
  author: string;
  photoUrl: string;
}

function picsumFallback(pillar: string, idx: number): UnsplashImage {
  const seed = encodeURIComponent(pillar.toLowerCase().replace(/\s+/g, "-"));
  return {
    id: `picsum-${idx}`,
    url: `https://picsum.photos/seed/${seed}/800/450`,
    small: `https://picsum.photos/seed/${seed}/400/225`,
    thumb: `https://picsum.photos/seed/${seed}/200/113`,
    alt: pillar,
    author: "Picsum Photos",
    photoUrl: "https://picsum.photos",
  };
}

function usePillarImages(dna: BusinessDNA) {
  const [images, setImages] = useState<Record<string, UnsplashImage>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pillars = getPillars(dna);
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      const results: Record<string, UnsplashImage> = {};

      await Promise.all(
        pillars.map(async (pillar, idx) => {
          try {
            const q = `${pillar} ${dna.businessName} business`.slice(0, 120);
            const res = await fetch(`/api/images?q=${encodeURIComponent(q)}&per_page=1`);
            if (res.ok) {
              const data = (await res.json()) as { images: UnsplashImage[] };
              if (data.images?.[0]) {
                results[pillar] = data.images[0];
                return;
              }
            }
          } catch { /* ignore */ }
          // Always fall back to Picsum so images never stay blank
          results[pillar] = picsumFallback(pillar, idx);
        })
      );

      if (!cancelled) {
        setImages(results);
        setLoading(false);
      }
    };

    void fetchAll();
    return () => { cancelled = true; };
  }, [dna.businessName]);

  return { images, loading };
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

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  day, date, pillar, platform, dna, image,
}: {
  day: string; date: string; pillar: string;
  platform: typeof PLATFORMS[number];
  dna: BusinessDNA;
  image: UnsplashImage | undefined;
}) {
  const caption = buildCaption(dna, pillar, platform.label);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border overflow-hidden bg-card shadow-sm">
      {/* Image */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {image ? (
          <img
            src={image.small}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        )}
        {/* Platform badge overlay */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${platform.color} shadow`}
        >
          {platform.label}
        </span>
        {/* Date chip */}
        <span className="absolute top-2 right-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full">
          {day} · {date}
        </span>
        {/* Photo credit (only for real Unsplash photos) */}
        {image && !image.id.startsWith("picsum-") && (
          <a
            href={`${image.photoUrl}?utm_source=marketai&utm_medium=referral`}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-1 right-2 text-[9px] text-white/70 hover:text-white"
          >
            📷 {image.author} / Unsplash
          </a>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-foreground leading-tight">{pillar}</p>
        <p className={`text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}>
          {caption}
        </p>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-[10px] text-primary font-medium hover:underline"
          >
            {expanded ? "Show less" : "Read full caption"}
          </button>
          <CopyButton text={caption} />
        </div>
      </div>
    </div>
  );
}

// ── Content Calendar ──────────────────────────────────────────────────────────

function ContentCalendarContent({ dna }: { dna: BusinessDNA }) {
  const [week, setWeek] = useState(1);
  const { images, loading: imagesLoading } = usePillarImages(dna);
  const calendar = buildCalendar(dna);

  return (
    <div className="space-y-4">
      {imagesLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Fetching images from Unsplash…
        </div>
      )}

      <Tabs value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
        <TabsList className="w-full">
          {[1, 2, 3, 4].map((w) => (
            <TabsTrigger key={w} value={String(w)} className="flex-1 text-xs">
              Week {w}
            </TabsTrigger>
          ))}
        </TabsList>

        {[1, 2, 3, 4].map((w) => (
          <TabsContent key={w} value={String(w)} className="mt-3">
            <div className="grid grid-cols-1 gap-4">
              {calendar
                .filter((r) => r.week === w)
                .map((row, i) => (
                  <PostCard
                    key={i}
                    day={row.day}
                    date={row.date}
                    pillar={row.pillar}
                    platform={row.platform}
                    dna={dna}
                    image={images[row.pillar]}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <p className="text-[11px] text-muted-foreground text-center">
        28-day schedule · Images via Unsplash · Powered by Business DNA
      </p>
    </div>
  );
}

// ── Caption Generator ─────────────────────────────────────────────────────────

const PLATFORM_TABS: { key: PlatformLabel; emoji: string; charLimit: string }[] = [
  { key: "Instagram", emoji: "📸", charLimit: "2,200 chars" },
  { key: "LinkedIn",  emoji: "💼", charLimit: "3,000 chars" },
  { key: "X",        emoji: "𝕏",  charLimit: "280 chars"   },
  { key: "Facebook", emoji: "👥", charLimit: "63,206 chars" },
];

function CaptionGeneratorContent({ dna }: { dna: BusinessDNA }) {
  const pillars = getPillars(dna);
  const [selectedPillar, setSelectedPillar] = useState(pillars[0]);

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
          const caption = buildCaption(dna, selectedPillar, key);
          return (
            <TabsContent key={key} value={key} className="mt-3">
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold">{key} Caption</p>
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

  // Seed state from sessionStorage immediately so the dashboard renders
  // even when Firebase Admin / Firestore hasn't been fully configured yet.
  useEffect(() => {
    if (!id) return;
    try {
      const cached = sessionStorage.getItem(`business_${id}`);
      if (cached) {
        setBusiness(JSON.parse(cached) as BusinessDoc);
        setLoading(false);
      }
    } catch {
      // ignore parse errors
    }
  }, [id]);

  // Real-time Firestore listener — enhances the session-cached data when
  // Firestore is available; degrades gracefully when it is not.
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "businesses", id);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          // Only show "not found" if we also have no sessionStorage fallback.
          const hasCached = Boolean(
            (() => {
              try { return sessionStorage.getItem(`business_${id}`); }
              catch { return null; }
            })()
          );
          if (!hasCached) {
            setNotFound(true);
          }
          setLoading(false);
          return;
        }
        // Firestore data is authoritative — overwrite session cache.
        const data = snap.data() as BusinessDoc;
        setBusiness(data);
        setLoading(false);
        setNotFound(false);
        try {
          sessionStorage.setItem(`business_${id}`, JSON.stringify(data));
        } catch { /* ignore */ }
      },
      (err) => {
        // Firestore unavailable (no config, permission denied, etc.)
        // Fall back silently to whatever sessionStorage already provided.
        console.warn("Firestore onSnapshot error (using cached data):", err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  const dna = business?.dna ?? null;
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
                        <SidebarMenuButton
                          isActive={item.id === "overview"}
                          className="gap-2.5"
                        >
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
              <button
                onClick={() => navigate("/")}
                className="hover:text-foreground transition-colors"
              >
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
            {/* PAGE TITLE */}
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
                  ? "Fetching your business profile…"
                  : businessUrl
                    ? `Analysis for ${businessUrl}`
                    : "Complete your analysis to unlock insights"}
              </p>
            </div>

            {/* Not found state */}
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

            {/* MAIN GRID */}
            {!notFound && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BUSINESS DNA */}
                <DashboardSection
                  icon={Brain}
                  title="Business DNA"
                  description="Brand voice, audience personas, and competitive positioning"
                  badge="Step 1"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fetching business profile…
                      </p>
                    </div>
                  ) : dna ? (
                    <BusinessDNAContent dna={dna} />
                  ) : undefined}
                </DashboardSection>

                {/* CONTENT CALENDAR */}
                <DashboardSection
                  icon={CalendarDays}
                  title="Content Calendar"
                  description="30-day AI-generated posting schedule across all channels"
                  badge="Step 2"
                >
                  {dna ? <ContentCalendarContent dna={dna} /> : undefined}
                </DashboardSection>

                {/* CAPTION GENERATOR */}
                <DashboardSection
                  icon={Sparkles}
                  title="Caption Generator"
                  description="Platform-optimized captions for Instagram, LinkedIn, X & more"
                  badge="Step 3"
                >
                  {dna ? <CaptionGeneratorContent dna={dna} /> : undefined}
                </DashboardSection>

                {/* AD INSIGHTS */}
                <div className="lg:col-span-2">
                  <DashboardSection
                    icon={BarChart2}
                    title="Ad Insights"
                    description="AI-powered ad performance, budget recommendations & creative briefs"
                    badge="Step 4"
                  >
                    <AdInsightsContent />
                  </DashboardSection>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
