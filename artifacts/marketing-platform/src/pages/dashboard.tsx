import { useParams, useLocation } from "wouter";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: Brain, label: "Business DNA", id: "dna" },
  { icon: CalendarDays, label: "Content Calendar", id: "calendar" },
  { icon: Sparkles, label: "Caption Generator", id: "captions" },
  { icon: BarChart2, label: "Ad Insights", id: "ads" },
];

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

export default function Dashboard() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const businessUrl = decodeURIComponent(params.id ?? "");

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
              <span className="text-foreground font-medium">Dashboard</span>
            </nav>
            <div className="ml-auto">
              <Badge variant="outline" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Analyzing
              </Badge>
            </div>
          </header>

          {/* PAGE BODY */}
          <main className="flex-1 p-6 overflow-auto">
            {/* PAGE TITLE */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {businessUrl
                  ? `Analysis for ${businessUrl}`
                  : "Complete your analysis to unlock insights"}
              </p>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BUSINESS DNA */}
              <DashboardSection
                icon={Brain}
                title="Business DNA"
                description="Brand voice, audience personas, and competitive positioning"
                badge="Step 1"
              />

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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
