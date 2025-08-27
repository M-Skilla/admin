"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  Megaphone,
  Users,
  Building,
  Upload,
  ArrowLeft,
  GraduationCap,
  Bug,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/announcements", label: "Announcements", icon: Megaphone },
    { href: "/users", label: "Users", icon: Users },
    { href: "/colleges", label: "Colleges", icon: Building },
    { href: "/programmes", label: "Programmes", icon: GraduationCap },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/debug", label: "Debug", icon: Bug },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-bold text-lg">
              Admin Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function BackButton() {
  return (
    <Link href="/">
      <Button variant="outline" size="sm" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
    </Link>
  );
}
