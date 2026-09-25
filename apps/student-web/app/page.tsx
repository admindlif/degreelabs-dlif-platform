import { PortalShell } from "@/components/layout/portal-shell";
import { DiscoverHero } from "@/components/discover/discover-hero";
import { LiveSessionSpotlight } from "@/components/discover/live-session-spotlight";
import { FellowToolkit } from "@/components/discover/fellow-toolkit";
import { FourWeekRoadmap } from "@/components/discover/four-week-roadmap";

export default function DiscoverHomePage() {
  return (
    <PortalShell breadcrumbs={["Cohort 2026-A", "DISCOVER (THINK)", "Overview"]}>
      {/* Zone 1: Discover Hero Banner with Serif Highlight & Progress */}
      <DiscoverHero />

      {/* Grid: Zone 2 (Spotlight) + Zone 3 (Fellow Toolkit & Team) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <LiveSessionSpotlight />
        </div>
        <div className="lg:col-span-4">
          <FellowToolkit />
        </div>
      </div>

      {/* Zone 4: Full 4-Week Journey Stepper & Sessions */}
      <FourWeekRoadmap />
    </PortalShell>
  );
}
