import {
  BarChart3,
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Settings,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import type { NavItem } from "./types";

export const authorityNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "/authority/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Incidents",
    href: "/authority/incidents",
    icon: ListChecks,
  },
  {
    title: "Verification",
    href: "/authority/verification",
    icon: ClipboardCheck,
  },
  {
    title: "Map",
    href: "/authority/map",
    icon: MapPinned,
  },
  {
    title: "Assignments",
    href: "/authority/assignments",
    icon: ShieldCheck,
  },
  {
    title: "Response",
    href: "/authority/response",
    icon: Truck,
  },
  {
    title: "Resolution",
    href: "/authority/resolution",
    icon: Wrench,
  },
  {
    title: "Analytics",
    href: "/authority/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    href: "/authority/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/authority/settings",
    icon: Settings,
  },
];
