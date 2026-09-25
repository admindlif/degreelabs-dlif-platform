import * as React from "react";
import { BookOpen, Users, Award, Download, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function FellowToolkit() {
  return (
    <div className="space-y-6">
      {/* Toolkit Card */}
      <Card variant="surface">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold">Fellow Toolkit</CardTitle>
          <Badge variant="brand" size="sm">
            DISCOVER (THINK) Phase
          </Badge>
        </div>
        <CardDescription className="text-xs text-[var(--color-text-body)] mb-4">
          Essential reference material, guidelines, and templates for your fellowship.
        </CardDescription>

        <div className="space-y-2.5">
          {/* Handbook Link */}
          <div className="p-3.5 rounded-xl bg-white border border-[var(--color-border-default)] hover:border-[var(--color-brand-blue)] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-blue-subtle)] text-[var(--color-brand-blue)] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-blue)] transition-colors">
                  DLIF Fellow Handbook — DISCOVER (v1.0, Sept 2026)
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">PDF • v1.0 (Sept 2026)</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-blue)]" />
          </div>

          {/* Submission Guidelines */}
          <div className="p-3.5 rounded-xl bg-white border border-[var(--color-border-default)] hover:border-[var(--color-brand-orange)] hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-orange-subtle)] text-[var(--color-brand-orange)] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-orange)] transition-colors">
                  Problem Rubric &amp; Guidelines
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Certificate in Problem Analysis &amp; Solution Architecture (DISCOVER)</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-orange)]" />
          </div>
        </div>
      </Card>

      {/* Team Squad Card */}
      <Card variant="canvas" className="border-[var(--color-border-default)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Team Alpha-4</CardTitle>
              <p className="text-[10px] text-[var(--color-text-muted)]">Company challenge: SK Innovation AI Diagnostics</p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            4 Fellows
          </Badge>
        </div>

        {/* Member Avatars */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-default)]">
          <div className="flex -space-x-2">
            {["SR", "KV", "AL", "MD"].map((initials, idx) => (
              <div
                key={initials}
                className="w-7 h-7 rounded-full bg-[var(--color-bg-subtle)] border-2 border-white text-[10px] font-bold text-[var(--color-text-secondary)] flex items-center justify-center shadow-xs"
                title={`Member ${idx + 1}`}
              >
                {initials}
              </div>
            ))}
          </div>

          <Button variant="ghost" size="sm" className="text-xs text-[var(--color-brand-blue)] font-bold">
            View Team Space &rarr;
          </Button>
        </div>
      </Card>
    </div>
  );
}
