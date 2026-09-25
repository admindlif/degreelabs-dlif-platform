"use client";

import * as React from "react";
import { Sidebar, type PortalRole } from "./sidebar";
import { Topbar } from "./topbar";

interface PortalShellProps {
  children: React.ReactNode;
  initialRole?: PortalRole;
  breadcrumbs?: string[];
}

export function PortalShell({
  children,
  initialRole,
  breadcrumbs,
}: PortalShellProps) {
  // Read initial role from environment or prop, defaulting to "student"
  const envRole = (process.env.NEXT_PUBLIC_PORTAL_ROLE as PortalRole) || "student";
  const [currentRole, setCurrentRole] = React.useState<PortalRole>(
    initialRole || envRole
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] flex text-[var(--color-text-primary)]">
      {/* Persistent Left Sidebar */}
      <Sidebar currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumbs={breadcrumbs} roleTitle="Fellow Portal" />
        <main className="flex-1 p-6 md:p-10 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
