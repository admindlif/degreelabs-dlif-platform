"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Compass,
  Calendar,
  FileCheck,
  FolderGit2,
  Users,
  UserCheck,
  Bell,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      title: "Learning Path",
      items: [
        {
          name: "DISCOVER",
          href: "/",
          icon: Compass,
          badge: "4 Weeks",
          badgeVariant: "brand" as const,
        },
        {
          name: "My Sessions",
          href: "/sessions",
          icon: Calendar,
          badge: "Next: Thu",
          badgeVariant: "muted" as const,
        },
        {
          name: "Weekly Outputs",
          href: "/assignments",
          icon: FileCheck,
          badge: "1 Due",
          badgeVariant: "gold" as const,
        },
        {
          name: "Resources",
          href: "/resources",
          icon: FolderGit2,
        },
      ],
    },
    {
      title: "Collaboration",
      items: [
        {
          name: "My Team",
          href: "/team",
          icon: Users,
          badge: "Alpha-4",
          badgeVariant: "blue" as const,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Notifications",
          href: "/notifications",
          icon: Bell,
          badge: "2",
          badgeVariant: "brand" as const,
        },
        {
          name: "Profile & 2FA",
          href: "/profile",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-[260px] h-screen sticky top-0 flex flex-col bg-[var(--color-bg-canvas)] border-r border-[var(--color-border-default)] select-none z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-[var(--color-border-default)] gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-36 h-9 flex items-center">
            <Image
              src="/degreelabs-logo.png"
              alt="DegreeLabs DLIF"
              width={160}
              height={36}
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Dedicated Portal Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="bg-[var(--color-bg-subtle)] px-3 py-2 rounded-xl flex items-center justify-between border border-[var(--color-border-default)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-blue)]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Fellow Portal
            </span>
          </div>
          <Badge variant="brand" size="sm" className="text-[10px]">
            Fellow
          </Badge>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="px-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              {group.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href === "/" && pathname === "/");

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                      isActive
                        ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] font-bold shadow-xs"
                        : "text-[var(--color-text-body)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
                    )}
                  >
                    {/* Active Brand Bar Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--color-brand-orange)]" />
                    )}

                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-[var(--color-brand-orange)]"
                            : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || "muted"}
                        size="sm"
                        className="text-[9px] px-2 py-0.5 font-bold"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cohort & User Footer Info */}
      <div className="p-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Cohort 2026-A
            </span>
          </div>
          <Badge variant="blue" size="sm">
            DISCOVER (THINK)
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-default)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "FL"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[var(--color-text-primary)] leading-tight truncate">
                {user ? `${user.first_name} ${user.last_name}` : "Fellow"}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                {user?.two_factor_enabled ? "2FA Enabled" : "Active"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-orange)] p-1.5 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
