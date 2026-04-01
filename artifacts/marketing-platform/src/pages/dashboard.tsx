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
} from "lucide-react";

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

  // Real-time Firestore listener
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "businesses", id);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setBusiness(snap.data() as BusinessDoc);
        setLoading(false);
        setNotFound(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
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
                />

                {/* CAPTION GENERATOR */}
                <DashboardSection
                  icon={Sparkles}
                  title="Caption Generator"
                  description="Platform-optimized captions for Instagram, LinkedIn, X & more"
                  badge="Step 3"
                />

                {/* AD INSIGHTS */}
                <DashboardSection
                  icon={BarChart2}
                  title="Ad Insights"
                  description="AI-powered ad copy, targeting recommendations & creative briefs"
                  badge="Step 4"
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
