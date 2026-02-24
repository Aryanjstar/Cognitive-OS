import {
  LayoutDashboard,
  ListTodo,
  Timer,
  BarChart3,
  BrainCircuit,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const dashboardNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Cognitive load overview",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ListTodo,
    description: "Manage synced tasks",
  },
  {
    title: "Focus",
    href: "/focus",
    icon: Timer,
    description: "Focus sessions & timer",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Trends & heatmaps",
  },
  {
    title: "Briefings",
    href: "/briefings",
    icon: BrainCircuit,
    description: "AI context briefings",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences & sync",
  },
];

export const marketingNav = [
  { title: "Features", href: "#features" },
  { title: "How It Works", href: "#how-it-works" },
  { title: "Pricing", href: "#pricing" },
  { title: "Guide", href: "#guide" },
  { title: "Demo", href: "/demo" },
];
