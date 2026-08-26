import {
  BarChart3,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import type { NavItem } from "./types";

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Authority approvals",
    href: "/admin/authorities",
    icon: ShieldCheck,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Incidents",
    href: "/admin/incidents",
    icon: Workflow,
  },
  {
    title: "Configuration",
    href: "/admin/config",
    icon: Settings,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];
