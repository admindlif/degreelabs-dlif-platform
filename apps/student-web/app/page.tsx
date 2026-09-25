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
import { useAuth } from "@/lib/auth-context";

export default function DiscoverHomePage() {
  const { user } = useAuth();
  const [context, setContext] = React.useState<FellowContext | null>(null);
  const [overview, setOverview] = React.useState<DiscoverOverview | null>(null);
  const [weeks, setWeeks] = React.useState<DiscoverWeek[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ctxData, ovData, weeksData] = await Promise.all([
        getFellowContext().catch((err) => {
          console.warn("Could not load fellow context:", err.message);
          return null;
        }),
        getDiscoverOverview().catch((err) => {
          console.warn("Could not load discover overview:", err.message);
          return null;
        }),
        getDiscoverWeeks().catch((err) => {
          console.warn("Could not load discover weeks:", err.message);
          return null;
        }),
      ]);

      setContext(ctxData);
      setOverview(ovData);
      setWeeks(weeksData);
    } catch (err: any) {
      setError(err?.message || "Failed to load fellowship data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const cohortName = context?.cohort?.code
    ? `Cohort ${context.cohort.code}`
    : "Cohort 2026-A";
  const phaseName = context?.current_phase
    ? `${context.current_phase.name} (${context.current_phase.development_role})`
    : "DISCOVER (THINK)";

  return (
    <PortalShell
      breadcrumbs={[cohortName, phaseName, "Overview"]}
      nextSession={overview?.next_session}
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-4 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={loadData}>
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
