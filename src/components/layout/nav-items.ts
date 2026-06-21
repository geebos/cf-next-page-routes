import {
  MousePointerIcon,
  SquareIcon,
  TextCursorInputIcon,
  ChevronDownIcon,
  LayersIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { title: "Buttons", href: "#buttons", icon: MousePointerIcon },
  { title: "Cards", href: "#cards", icon: SquareIcon },
  { title: "Forms", href: "#forms", icon: TextCursorInputIcon },
  { title: "Select", href: "#select", icon: ChevronDownIcon },
  { title: "Overlays", href: "#overlays", icon: LayersIcon },
];
