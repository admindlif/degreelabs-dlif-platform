"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface PortalShellProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
}

export function PortalShell({
  children,
  breadcrumbs,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] flex text-[var(--color-text-primary)]">
      {/* Persistent Left Sidebar */}
      <Sidebar />

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
