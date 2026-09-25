"use client";

import { PortalShell } from "@/components/layout/portal-shell";

export default function AssignmentsPage() {
    return (
        <PortalShell breadcrumbs={["DISCOVER", "Weekly Outputs"]}>
            <div className="p-8 rounded-2xl bg-white border border-[var(--color-border-default)]">
                <h1 className="text-2xl font-extrabold">
                    Weekly Outputs
                </h1>

                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    Weekly output submission will be connected to the Fellow submission API.
                </p>
            </div>
        </PortalShell>
    );
}