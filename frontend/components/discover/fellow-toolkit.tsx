"use client";

import * as React from "react";
import {
  BookOpen,
  Users,
  Award,
  Download,
  ArrowUpRight,
  FileText,
  Link2,
  AlertCircle,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FellowTeam, PhaseResource } from "@/lib/api/types";
import { getFellowTeam, getFellowResources } from "@/lib/api/toolkit";

// ── Icon map by resource_type ──────────────────────────────────────────────
function ResourceIcon({ type }: { type: string }) {
  const base = "w-4 h-4";
  switch (type) {
    case "handbook":
      return <BookOpen className={base} />;
    case "rubric":
      return <Award className={base} />;
    case "template":
      return <FileText className={base} />;
    default:
      return <Link2 className={base} />;
  }
}

function resourceAccentColor(type: string) {
  switch (type) {
    case "handbook":
      return {
        bg: "var(--color-brand-blue-subtle)",
        text: "var(--color-brand-blue)",
        hover: "hover:border-[var(--color-brand-blue)]",
        actionIcon: <Download className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-blue)]" />,
      };
    case "rubric":
    default:
      return {
        bg: "var(--color-brand-orange-subtle)",
        text: "var(--color-brand-orange)",
        hover: "hover:border-[var(--color-brand-orange)]",
        actionIcon: <ArrowUpRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-orange)]" />,
      };
  }
}

// ── Fallback static resources (displayed only if API returns empty) ─────────
const FALLBACK_RESOURCES: PhaseResource[] = [
  {
    id: "fallback-handbook",
    title: "DLIF Fellow Handbook — DISCOVER (v1.0, Sept 2026)",
    subtitle: "PDF • v1.0 (Sept 2026)",
    resource_type: "handbook",
    url: null,
    is_downloadable: true,
    sequence: 1,
  },
  {
    id: "fallback-rubric",
    title: "Problem Rubric & Guidelines",
    subtitle: "Certificate in Problem Analysis & Solution Architecture (DISCOVER)",
    resource_type: "rubric",
    url: null,
    is_downloadable: false,
    sequence: 2,
  },
];

export function FellowToolkit() {
  const [team, setTeam] = React.useState<FellowTeam | null>(null);
  const [resources, setResources] = React.useState<PhaseResource[]>(FALLBACK_RESOURCES);
  const [teamLoading, setTeamLoading] = React.useState(true);
  const [resourcesLoading, setResourcesLoading] = React.useState(true);

  React.useEffect(() => {
    getFellowResources()
      .then((data) => {
        if (data && data.length > 0) {
          setResources(data);
        }
        // if empty, keep fallback
      })
      .catch(() => {
        // keep fallback on error
      })
      .finally(() => setResourcesLoading(false));

    getFellowTeam()
      .then(setTeam)
      .catch(() => setTeam(null))
      .finally(() => setTeamLoading(false));
  }, []);

  const phaseBadgeLabel = resources.length > 0
    ? "DISCOVER (THINK) Phase"
    : "DISCOVER (THINK) Phase";

  return (
    <div className="space-y-6">
      {/* ── Resources Toolkit Card ─────────────────────────────────────── */}
      <Card variant="surface">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold">Fellow Toolkit</CardTitle>
          <Badge variant="brand" size="sm">
            {phaseBadgeLabel}
          </Badge>
        </div>
        <CardDescription className="text-xs text-[var(--color-text-body)] mb-4">
          Essential reference material, guidelines, and templates for your fellowship.
        </CardDescription>

        <div className="space-y-2.5">
          {resourcesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white border border-[var(--color-border-default)] animate-pulse h-14"
                />
              ))}
            </div>
          ) : (
            resources.map((resource) => {
              const accent = resourceAccentColor(resource.resource_type);
              const handleClick = () => {
                if (resource.url) window.open(resource.url, "_blank");
              };
              return (
                <div
                  key={resource.id}
                  onClick={handleClick}
                  className={`p-3.5 rounded-xl bg-white border border-[var(--color-border-default)] ${accent.hover} hover:shadow-xs transition-all flex items-center justify-between group ${resource.url ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: accent.bg, color: accent.text }}
                    >
                      <ResourceIcon type={resource.resource_type} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-bold text-[var(--color-text-primary)] transition-colors"
                        style={{ color: undefined }}
                      >
                        {resource.title}
                      </p>
                      {resource.subtitle && (
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {resource.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  {accent.actionIcon}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ── Team Card ─────────────────────────────────────────────────── */}
      <Card variant="canvas" className="border-[var(--color-border-default)]">
        {teamLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-[var(--color-bg-subtle)] rounded w-1/2" />
            <div className="h-3 bg-[var(--color-bg-subtle)] rounded w-3/4" />
            <div className="flex gap-2 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-[var(--color-bg-subtle)]" />
              ))}
            </div>
          </div>
        ) : team ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Team {team.name}</CardTitle>
                  {team.company_challenge && (
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Company challenge: {team.company_challenge}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="success" size="sm">
                {team.member_count} {team.member_count === 1 ? "Fellow" : "Fellows"}
              </Badge>
            </div>

            {/* Member Avatars */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-default)]">
              <div className="flex -space-x-2">
                {team.members.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="w-7 h-7 rounded-full bg-[var(--color-bg-subtle)] border-2 border-white text-[10px] font-bold text-[var(--color-text-secondary)] flex items-center justify-center shadow-xs"
                    title={`${member.first_name} ${member.last_name}${member.team_role === "lead" ? " (Lead)" : ""}`}
                  >
                    {member.initials}
                  </div>
                ))}
                {team.members.length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-[var(--color-brand-blue-subtle)] border-2 border-white text-[10px] font-bold text-[var(--color-brand-blue)] flex items-center justify-center shadow-xs">
                    +{team.members.length - 5}
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="text-xs text-[var(--color-brand-blue)] font-bold">
                View Team Space →
              </Button>
            </div>
          </>
        ) : (
          /* No team assigned yet */
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Team assignment pending. Check back soon.</span>
          </div>
        )}
      </Card>
    </div>
  );
}
