import {
  Bell,
  Camera,
  CloudRain,
  FileText,
  LayoutDashboard,
  Map,
  Phone,
  User,
} from "lucide-react";

import type { NavItem } from "./types";

export const citizenNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/citizen/dashboard",
    icon: LayoutDashboard,
    mobilePrimary: true,
  },
  {
    title: "Report",
    href: "/citizen/report",
    icon: Camera,
    description: "Capture live flood or drainage evidence",
    mobilePrimary: true,
  },
  {
    title: "Live Map",
    href: "/map",
    icon: Map,
    mobilePrimary: true,
  },
  {
    title: "My Reports",
    href: "/citizen/reports",
    icon: FileText,
    mobilePrimary: true,
  },
  {
    title: "Notifications",
    href: "/citizen/notifications",
    icon: Bell,
  },
  {
    title: "Weather",
    href: "/citizen/weather",
    icon: CloudRain,
  },
  {
    title: "Emergency",
    href: "/citizen/emergency",
    icon: Phone,
  },
  {
    title: "Profile",
    href: "/citizen/profile",
    icon: User,
  },
];

export const citizenMobilePrimaryItems = citizenNavItems.filter(
  (item) => item.mobilePrimary
);

export const citizenSecondaryItems = citizenNavItems.filter(
  (item) => !item.mobilePrimary
);
