"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ListChecks, Gift, ChatCenteredText, User } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Home",
    icon: House,
    href: "/dashboard",
  },
  {
    label: "Habits",
    icon: ListChecks,
    href: "/habits",
  },
  {
    label: "Rewards",
    icon: Gift,
    href: "/rewards",
  },
  {
    label: "Chat",
    icon: ChatCenteredText,
    href: "/chat",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 md:hidden">
      <div className="bg-background/80 backdrop-blur-md border-t">
        <nav className="flex justify-around">
          {items.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/');
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 