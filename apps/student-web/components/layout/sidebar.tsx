"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Compass,
  Users,
  Bell,
  ShieldCheck,
  LogOut,
  LockKeyhole,
  Circle,
} from "lucide-react";

import { getDiscoverWeeks } from "@/lib/api/discover";
import { getFellowTeam } from "@/lib/api/toolkit";

import {
  DiscoverWeek,
  FellowContext,
  SessionSummary,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  className?: string;
  context?: FellowContext | null;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

function SessionSidebarItem({
  session,
  onNavigate,
}: {
  session: SessionSummary;
  onNavigate?: () => void;
}) {
  const locked = !session.is_unlocked;

  if (locked) {
    return (
      <div
        className="
          flex items-center justify-between
          px-3 py-2 rounded-lg
          text-xs
          text-[var(--color-text-muted)]
          cursor-not-allowed
        "
      >
        <div className="flex items-center gap-2">
          <LockKeyhole className="w-3.5 h-3.5" />

          <span>
            Session {session.session_number}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/sessions/${session.id}`}
      onClick={onNavigate}
      className="
        flex items-center gap-2
        px-3 py-2 rounded-lg
        text-xs font-semibold
        text-[var(--color-text-body)]
        hover:bg-[var(--color-bg-subtle)]
        hover:text-[var(--color-text-primary)]
        transition-colors
      "
    >
      <Circle className="w-2.5 h-2.5 fill-current text-[var(--color-brand-orange)]" />

      <div className="min-w-0">
        <div>
          Session {session.session_number}
        </div>

        <div className="text-[10px] font-normal truncate text-[var(--color-text-muted)]">
          {session.title}
        </div>
      </div>
    </Link>
  );
}

export function Sidebar({
  className,
  context,
  mobileOpen = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [weeks, setWeeks] = React.useState<DiscoverWeek[]>([]);

  const [teamName, setTeamName] = React.useState<string | null>(null);

  React.useEffect(() => {
    getDiscoverWeeks()
      .then(setWeeks)
      .catch((error) => {
        console.warn(
          "Unable to load sidebar DISCOVER weeks:",
          error
        );
      });

    getFellowTeam()
      .then((team) => setTeamName(team.name))
      .catch(() => setTeamName(null));
  }, []);

  const orderedWeeks = [...weeks].sort(
    (left, right) => left.sequence - right.sequence
  );
  const induction = orderedWeeks
    .flatMap((week) => week.sessions)
    .find(
      (session) => session.session_number === 0
    );

  const navigationGroups: Array<{
    title: string;
    items: Array<{
      name: string;
      href: string;
      icon: typeof Users;
      badge?: string;
      badgeVariant?: "blue";
    }>;
  }> = [
      {
        title: "Collaboration",
        items: [
          {
            name: "Company Challenge",
            href: "/company-challenge",
            icon: BriefcaseBusiness,
          },
          {
            name: "My Team",
            href: "/team",
            icon: Users,
            badge: teamName ?? undefined,
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
        "fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(260px,calc(100vw-3rem))] flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-[260px] lg:translate-x-0 lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border-default)] px-5">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3 group">
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
      <div className="shrink-0 px-4 pb-2 pt-3">
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
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-4">
        {/* DISCOVER Session Navigation */}
        <div className="space-y-4">
          <div>
            <Link
              href="/"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold",
                pathname === "/"
                  ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-body)] hover:bg-[var(--color-bg-subtle)]"
              )}
            >
              <Compass className="w-4 h-4 text-[var(--color-brand-orange)]" />
              DISCOVER
            </Link>
          </div>

          {induction && (
            <div className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                Induction
              </h4>

              <SessionSidebarItem
                session={induction}
                onNavigate={onNavigate}
              />
            </div>
          )}

          {orderedWeeks.map(
            (week) => (
              <div
                key={week.id}
                className="space-y-1"
              >
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Week {week.week_number}
                </h4>

                <div className="space-y-0.5">
                  {[...week.sessions]
                    .filter(
                      (session) => session.session_number !== 0
                    )
                    .sort(
                      (left, right) => left.sequence - right.sequence
                    )
                    .map((session) => (
                      <SessionSidebarItem
                        key={session.id}
                        session={session}
                        onNavigate={onNavigate}
                      />
                    ))}
                </div>
              </div>
            )
          )}
        </div>
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
                    onClick={onNavigate}
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

                    <div className="flex min-w-0 items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-[var(--color-brand-orange)]"
                            : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <Badge
                        variant={item.badgeVariant || "muted"}
                        size="sm"
                        className="max-w-24 truncate text-[9px] px-2 py-0.5 font-bold"
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
      <div className="shrink-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="w-2 h-2 shrink-0 rounded-full bg-[var(--color-success)]" />
            <span className="truncate text-xs font-semibold text-[var(--color-text-secondary)]">
              {context?.cohort.name ?? "Cohort"}
            </span>
          </div>
          <Badge variant="blue" size="sm" className="max-w-28 shrink-0 truncate">
            {context
              ? `${context.current_phase.name} (${context.current_phase.development_role})`
              : "Phase"}
          </Badge>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border-default)] pt-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-navy)] text-[10px] font-bold text-white">
              {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "FL"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[11px] font-bold leading-tight text-[var(--color-text-primary)]">
                {user ? `${user.first_name} ${user.last_name}` : "Fellow"}
              </span>
              <span className="truncate text-[9px] text-[var(--color-text-muted)]">
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
