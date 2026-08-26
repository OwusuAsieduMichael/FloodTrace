import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  external?: boolean;
  /** Shown in compact mobile nav */
  mobilePrimary?: boolean;
  /** Optional shorter label for the compact mobile bar */
  mobileTitle?: string;
}
