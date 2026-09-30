"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DiscoverHero } from "@/components/discover/discover-hero";
import { LiveSessionSpotlight } from "@/components/discover/live-session-spotlight";
import { FellowToolkit } from "@/components/discover/fellow-toolkit";
import { FourWeekRoadmap } from "@/components/discover/four-week-roadmap";
import { Button } from "@/components/ui/button";
import { getFellowContext } from "@/lib/api/fellow";
import { getDiscoverOverview, getDiscoverWeeks } from "@/lib/api/discover";
import { DiscoverOverview, DiscoverWeek, FellowContext } from "@/lib/api/types";

async function fetchDashboardData() {
  return Promise.all([
    getFellowContext().catch((err: unknown) => {
      console.warn(
        "Could not load fellow context:",
        err instanceof Error ? err.message : err
      );
      return null;
    }),
    getDiscoverOverview().catch((err: unknown) => {
      console.warn(
        "Could not load discover overview:",
        err instanceof Error ? err.message : err
      );
      return null;
    }),
    getDiscoverWeeks().catch((err: unknown) => {
      console.warn(
        "Could not load discover weeks:",
        err instanceof Error ? err.message : err
      );
      return null;
    }),
  ]);
}

export default function DiscoverHomePage() {
  const [context, setContext] = React.useState<FellowContext | null>(null);
  const [overview, setOverview] = React.useState<DiscoverOverview | null>(null);
  const [weeks, setWeeks] = React.useState<DiscoverWeek[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const [ctxData, ovData, weeksData] = await fetchDashboardData();

      setContext(ctxData);
      setOverview(ovData);
      setWeeks(weeksData);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load fellowship data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const retryLoad = React.useCallback(() => {
    setLoading(true);
    setError(null);
    void loadData();
  }, [loadData]);

  React.useEffect(() => {
    let cancelled = false;

    void fetchDashboardData()
      .then(([ctxData, ovData, weeksData]) => {
        if (cancelled) return;
        setContext(ctxData);
        setOverview(ovData);
        setWeeks(weeksData);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load fellowship data. Please try again."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <PortalShell breadcrumbItems={["Overview"]} context={context}>
        <div className="rounded-2xl border border-[var(--color-border-default)] p-12 text-center text-sm text-[var(--color-text-muted)]">
          Loading fellowship overview...
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      breadcrumbItems={["Overview"]}
      nextSession={overview?.next_session}
      context={context}
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-4 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={retryLoad}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Zone 1: Discover Hero Banner with Serif Highlight & Progress */}
      <DiscoverHero
        cohort={context?.cohort}
        phase={context?.current_phase}
        progress={overview?.progress}
        nextSession={overview?.next_session}
      />

      {/* Grid: Zone 2 (Spotlight) + Zone 3 (Fellow Toolkit & Team) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <LiveSessionSpotlight session={overview?.next_session} />
        </div>
        <div className="lg:col-span-4">
          <FellowToolkit />
        </div>
      </div>

      {/* Zone 4: Full 4-Week Journey Stepper & Sessions */}
      <FourWeekRoadmap weeks={weeks} />
    </PortalShell>
  );
}
