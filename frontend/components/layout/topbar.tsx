"use client";

import * as React from "react";
import { Search, Bell, ShieldCheck, ChevronRight, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  breadcrumbs?: string[];
  roleTitle?: string;
}

export function Topbar({
  breadcrumbs = ["Cohort 2026-A", "DISCOVER (THINK)", "Week 1"],
  roleTitle = "Fellow Portal",
}: TopbarProps) {
  return (
    <header className="h-16 sticky top-0 z-20 bg-[var(--color-bg-canvas)]/90 backdrop-blur-md border-b border-[var(--color-border-default)] px-6 flex items-center justify-between gap-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? "font-bold text-[var(--color-text-primary)]"
                  : "hover:text-[var(--color-text-secondary)] cursor-pointer"
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Center Search / Status Pill */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search sessions, challenges, resources..."
            className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-brand-blue)] focus:bg-white text-xs text-[var(--color-text-primary)] rounded-full pl-9 pr-4 py-2 outline-none transition-all placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Next Session Quick Trigger */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-orange-subtle)] border border-[#FFD5C6]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] animate-pulse" />
          <span className="text-xs font-bold text-[var(--color-brand-orange)]">
            Live in 2h: Session 02
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-body)] hover:text-[var(--color-text-primary)] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] absolute top-1.5 right-1.5" />
        </button>

        {/* Security / 2FA status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8FAF0] border border-[#BCEFD3] text-[11px] font-bold text-[#128C48]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">2FA Verified</span>
        </div>
      </div>
    </header>
  );
}
