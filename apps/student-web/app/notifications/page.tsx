"use client";

import { Bell } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

export default function NotificationsPage() {
    return (
        <PortalShell
            breadcrumbs={[
                "Cohort 2026-A",
                "DISCOVER (THINK)",
                "Notifications",
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold">
                        Notifications
                    </h1>

                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        View fellowship updates, session reminders, and announcements.
                    </p>
                </div>

                <div className="p-8 rounded-2xl bg-white border border-[var(--color-border-default)] text-center">
                    <Bell className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-3" />

                    <h2 className="font-bold">
                        No notifications yet
                    </h2>

                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        New fellowship updates will appear here.
                    </p>
                </div>
            </div>
        </PortalShell>
    );
}