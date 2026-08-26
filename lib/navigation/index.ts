export { adminNavItems } from "./admin";
export { authorityNavItems } from "./authority";
export {
  citizenMobilePrimaryItems,
  citizenNavItems,
  citizenSecondaryItems,
} from "./citizen";
export { previousInterfacePath } from "./previous-interface";
export type { NavItem } from "./types";

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/map") {
    return pathname === "/map";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
