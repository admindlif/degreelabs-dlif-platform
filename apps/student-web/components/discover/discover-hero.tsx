import * as React from "react";
import { Sparkles, Calendar, CheckCircle2 } from "lucide-react";
import { SerifHighlight } from "@/components/ui/serif-highlight";
import { Badge } from "@/components/ui/badge";

export function DiscoverHero() {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-8 md:p-10 mb-8">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--color-brand-orange-subtle)] rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--color-brand-blue-subtle)] rounded-full blur-3xl pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">
              DLIF Fellow 2026-A
            </Badge>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              DISCOVER (THINK) → VALIDATE (PROVE) → GROW (DELIVER)
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            DISCOVER
          </h1>

          {/* Signature Brand Voice with Italic Serif Accent */}
          <p className="text-lg md:text-xl text-[var(--color-text-body)] font-medium leading-relaxed">
            The classroom gives knowledge.{" "}
            <SerifHighlight>Discover builds capability.</SerifHighlight>
          </p>
        </div>

        {/* 4-Week Journey Progress Widget */}
        <div className="bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] rounded-2xl p-5 min-w-[280px] shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[var(--color-text-secondary)]">DISCOVER Progress</span>
            <span className="text-[var(--color-brand-orange)] font-bold">Week 1 of 4 • 25%</span>
          </div>

          {/* 4-Segment Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            <div className="h-2 rounded-full bg-[var(--color-brand-orange)]" title="W1: Active" />
            <div className="h-2 rounded-full bg-[var(--color-border-default)]" title="W2: Upcoming" />
            <div className="h-2 rounded-full bg-[var(--color-border-default)]" title="W3: Locked" />
            <div className="h-2 rounded-full bg-[var(--color-border-default)]" title="W4: Locked" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" /> 2 Sessions done
            </span>
            <span>Next: Session 02</span>
          </div>
        </div>
      </div>
    </div>
  );
}
