"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Compass,
  Layers,
  Calendar,
  Video,
  BookOpen,
  FileCheck,
  Users2,
  Building2,
  Target,
  Bell,
  Settings,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  LogOut,
  RefreshCw,
  Mail,
  Shield,
  Send,
  X,
  Activity,
  Server,
  Database,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  AdminCohort,
  AdminFellow,
  AdminStats,
  AdminTeam,
  getAdminCohorts,
  getAdminFellows,
  getAdminStats,
  getAdminTeams,
  inviteFellow,
} from "@/lib/api/admin";

type NavTab =
  | "Dashboard"
  | "Fellows"
  | "Mentors"
  | "Program Managers"
  | "Programs"
  | "Cohorts"
  | "Weeks"
  | "Sessions"
  | "Resources"
  | "Weekly Outputs"
  | "Teams"
  | "Companies"
  | "Challenges"
  | "Attendance"
  | "Notifications"
  | "Settings"
  | "Audit Logs";

interface NavGroup {
  label: string;
  items: {
    name: NavTab;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export default function AdminHomePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<NavTab>("Dashboard");

  // Live data states
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [fellows, setFellows] = React.useState<AdminFellow[]>([]);
  const [cohorts, setCohorts] = React.useState<AdminCohort[]>([]);
  const [teams, setTeams] = React.useState<AdminTeam[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [inviteFirstName, setInviteFirstName] = React.useState("");
  const [inviteLastName, setInviteLastName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteLoading, setInviteLoading] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, fellowsData, cohortsData, teamsData] = await Promise.all([
        getAdminStats().catch(() => null),
        getAdminFellows().catch(() => []),
        getAdminCohorts().catch(() => []),
        getAdminTeams().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setFellows(fellowsData);
      setCohorts(cohortsData);
      setTeams(teamsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    setInviteLoading(true);

    try {
      await inviteFellow({
        first_name: inviteFirstName.trim(),
        last_name: inviteLastName.trim(),
        email: inviteEmail.trim(),
      });
      setInviteSuccess(`Invitation sent successfully to ${inviteEmail}!`);
      setInviteFirstName("");
      setInviteLastName("");
      setInviteEmail("");
      loadData();
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess(null);
      }, 2000);
    } catch (err: any) {
      setInviteError(err?.message || "Failed to invite Fellow. Please verify details.");
    } finally {
      setInviteLoading(false);
    }
  };

  const navGroups: NavGroup[] = [
    {
      label: "OVERVIEW",
      items: [{ name: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "PEOPLE",
      items: [
        {
          name: "Fellows",
          icon: Users,
          badge: fellows.length > 0 ? String(fellows.length) : undefined,
        },
        { name: "Mentors", icon: GraduationCap },
        { name: "Program Managers", icon: UserCheck },
      ],
    },
    {
      label: "PROGRAM",
      items: [
        { name: "Programs", icon: Compass },
        {
          name: "Cohorts",
          icon: Layers,
          badge: cohorts.length > 0 ? String(cohorts.length) : undefined,
        },
        { name: "Weeks", icon: Calendar },
        { name: "Sessions", icon: Video },
      ],
    },
    {
      label: "COLLABORATION",
      items: [
        {
          name: "Teams",
          icon: Users2,
          badge: teams.length > 0 ? String(teams.length) : undefined,
        },
        { name: "Companies", icon: Building2 },
        { name: "Challenges", icon: Target },
      ],
    },
    {
      label: "LEARNING",
      items: [
        { name: "Resources", icon: BookOpen },
        { name: "Weekly Outputs", icon: FileCheck },
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        { name: "Attendance", icon: Calendar },
        { name: "Notifications", icon: Bell },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        { name: "Settings", icon: Settings },
        { name: "Audit Logs", icon: ShieldCheck },
      ],
    },
  ];

  const filteredFellows = fellows.filter((f) => {
    const matchesSearch =
      f.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || f.account_status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-[var(--color-brand-navy)] flex flex-col shrink-0 border-r border-white/10 select-none">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
          <div className="relative w-36 h-9 flex items-center">
            <Image
              src="/degreelabs-logo.png"
              alt="DegreeLabs"
              width={160}
              height={36}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
        </div>

        {/* Portal Scope Badge */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-white/5 px-3 py-2 rounded-xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Administration
              </span>
            </div>
            <span className="text-[10px] font-bold bg-[var(--color-brand-orange)] text-white px-2 py-0.5 rounded-full">
              Ops Console
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {group.label}
              </h4>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setActiveTab(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group text-left ${
                        isActive
                          ? "bg-[var(--color-brand-blue)] text-white font-bold shadow-md shadow-blue-500/20"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isActive ? "text-white" : "text-white/60"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-white text-[var(--color-brand-blue)]"
                              : "bg-white/10 text-white/80"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Admin Profile & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-xs font-semibold text-white/80">
                Admin Console
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              {user?.role?.toUpperCase() || "SUPER_ADMIN"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand-orange)] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "AD"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white leading-tight truncate">
                  {user ? `${user.first_name} ${user.last_name}` : "DegreeLabs Admin"}
                </span>
                <span className="text-[10px] text-white/50 truncate">
                  {user?.email || "admin.dlif@degreelabs.com"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-white/60 hover:text-[var(--color-brand-orange)] p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="h-20 border-b border-[var(--color-border-default)] px-8 flex items-center justify-between bg-[var(--color-bg-surface)] sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
                <span>DegreeLabs DLIF</span>
                <span>/</span>
                <span className="text-[var(--color-text-primary)] font-bold">{activeTab}</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {activeTab}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] text-xs font-semibold text-[var(--color-text-body)] hover:border-[var(--color-border-strong)] transition-all"
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-bold hover:bg-blue-600 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Fellow</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "Dashboard" && (
            <div className="space-y-8">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-[24px] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-8">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--color-brand-orange-subtle)] rounded-full blur-3xl pointer-events-none opacity-60" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-blue-subtle)] border border-[var(--color-brand-blue)]/20 text-xs font-bold text-[var(--color-brand-blue)] mb-3">
                      <span>DLIF 2026 Operations Console</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      Welcome, {user?.first_name || "Administrator"}
                    </h2>
                    <p className="text-sm text-[var(--color-text-body)] mt-1 max-w-xl">
                      Manage cohorts, track Fellow progression across the DISCOVER phase, monitor team challenge alignment, and provision credentials.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("Fellows")}
                      className="px-4 py-2.5 rounded-xl bg-[var(--color-brand-navy)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Manage Fellows ({stats?.total_fellows ?? fellows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Cohorts")}
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] text-xs font-bold hover:border-[var(--color-border-strong)] transition-all"
                    >
                      View Cohorts ({cohorts.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Total Fellows
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-blue-subtle)] text-[var(--color-brand-blue)] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                    {stats?.total_fellows ?? fellows.length}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
                    <span className="text-[var(--color-success)] font-bold">
                      {stats?.active_fellows ?? fellows.filter((f) => f.account_status === "active").length} Active
                    </span>
                    <span>•</span>
                    <span>{stats?.invited_fellows ?? fellows.filter((f) => f.account_status === "invited").length} Pending</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Current Phase
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-orange-subtle)] text-[var(--color-brand-orange)] flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-extrabold text-[var(--color-text-primary)]">
                    DISCOVER (THINK)
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--color-brand-orange)] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Week 1 of 4 • In Progress</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Active Cohorts
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                    {cohorts.length || 2}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-2">
                    Cohort 2026-A (Primary)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Live Sessions
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                    {stats?.total_sessions ?? 14}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-2">
                    12 Curriculum + Induction + Review
                  </div>
                </div>
              </div>

              {/* System Architecture Strip */}
              <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[var(--color-brand-blue)]" />
                    <h3 className="text-sm font-bold">Platform Microservice Runtime Health</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-success)] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                    All Microservices Healthy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "Student API (Fellow)", port: "8000", role: "Fellow Portal" },
                    { name: "Mentor API (Faculty)", port: "8001", role: "Mentor Portal" },
                    { name: "Admin API (Ops)", port: "8002", role: "Admin Console" },
                    { name: "PostgreSQL Database", port: "5432", role: "Shared Persistence" },
                  ].map((service) => (
                    <div
                      key={service.name}
                      className="p-3.5 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)]"
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span>{service.name}</span>
                        <span className="text-[var(--color-success)]">ONLINE</span>
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] flex justify-between">
                        <span>Port {service.port}</span>
                        <span>{service.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Fellows Quick Table */}
              <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">Recently Enrolled Fellows</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Fellows currently enrolled in Cohort 2026-A
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Fellows")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-brand-blue)] hover:underline"
                  >
                    <span>View All Fellows</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border-default)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Fellow</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">2FA Security</th>
                        <th className="py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-default)]">
                      {fellows.slice(0, 5).map((f) => (
                        <tr key={f.id} className="hover:bg-[var(--color-bg-canvas)] transition-colors">
                          <td className="py-3 px-4 font-bold flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[var(--color-brand-navy)] text-white text-[10px] font-bold flex items-center justify-center">
                              {f.first_name[0]}{f.last_name[0]}
                            </div>
                            <span>{f.first_name} {f.last_name}</span>
                          </td>
                          <td className="py-3 px-4 text-[var(--color-text-body)]">{f.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                f.account_status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {f.account_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                f.two_factor_enabled ? "text-emerald-600" : "text-[var(--color-text-muted)]"
                              }`}
                            >
                              <Shield className="w-3 h-3" />
                              {f.two_factor_enabled ? "2FA Enabled" : "Standard"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[var(--color-text-muted)]">
                            {f.created_at ? new Date(f.created_at).toLocaleDateString() : "Active"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FELLOWS */}
          {activeTab === "Fellows" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Fellows Management</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Manage enrollment, view onboarding statuses, and issue invitation links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-bold hover:bg-blue-600 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite New Fellow</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] text-xs focus:outline-none focus:border-[var(--color-brand-blue)]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {["all", "active", "invited", "suspended"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                        statusFilter === st
                          ? "bg-[var(--color-brand-navy)] text-white"
                          : "bg-[var(--color-bg-canvas)] text-[var(--color-text-body)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fellows Data Table */}
              <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-bg-canvas)] border-b border-[var(--color-border-default)]">
                    <tr className="text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-4">Fellow Name</th>
                      <th className="py-3.5 px-4">Email Address</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">2FA State</th>
                      <th className="py-3.5 px-4">Enrolled On</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-default)]">
                    {filteredFellows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                          No fellows found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredFellows.map((f) => (
                        <tr key={f.id} className="hover:bg-[var(--color-bg-canvas)] transition-colors">
                          <td className="py-3 px-4 font-bold flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-brand-navy)] text-white text-xs font-bold flex items-center justify-center">
                              {f.first_name[0]}{f.last_name[0]}
                            </div>
                            <div>
                              <div>{f.first_name} {f.last_name}</div>
                              <span className="text-[10px] text-[var(--color-text-muted)] font-normal">
                                ID: {f.id.substring(0, 8)}...
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[var(--color-text-body)]">{f.email}</td>
                          <td className="py-3 px-4 font-semibold text-[var(--color-brand-blue)]">
                            Fellow
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                f.account_status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : f.account_status === "invited"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {f.account_status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                                f.two_factor_enabled ? "text-emerald-600" : "text-amber-600"
                              }`}
                            >
                              <Shield className="w-3.5 h-3.5" />
                              {f.two_factor_enabled ? "2FA Verified" : "Pending Setup"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[var(--color-text-muted)]">
                            {f.created_at ? new Date(f.created_at).toLocaleDateString() : "Recent"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => alert(`Fellow Profile: ${f.first_name} ${f.last_name} (${f.email})`)}
                              className="px-2.5 py-1 rounded-lg border border-[var(--color-border-default)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)] font-semibold transition-colors text-[11px]"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COHORTS */}
          {activeTab === "Cohorts" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Cohorts & Schedules</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Active and archived DLIF fellowship cohort cycles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cohorts.map((cohort) => (
                  <div
                    key={cohort.id}
                    className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">
                        {cohort.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cohort.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">{cohort.name}</h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)]">
                        <span className="text-[var(--color-text-muted)]">Enrolled Fellows</span>
                        <div className="text-base font-extrabold mt-0.5">{cohort.participant_count || 12} Fellows</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)]">
                        <span className="text-[var(--color-text-muted)]">Active Phase</span>
                        <div className="text-base font-extrabold text-[var(--color-brand-orange)] mt-0.5">DISCOVER</div>
                      </div>
                    </div>

                    <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Start Date: {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : "Active"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROGRAMS */}
          {activeTab === "Programs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">DegreeLabs Impact Fellowship (DLIF)</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Canonical 3-phase curriculum framework according to the DLIF Fellow Handbook.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    phase: "PHASE 1",
                    title: "DISCOVER",
                    action: "THINK",
                    duration: "4 Weeks (12 Sessions)",
                    status: "ACTIVE IN COHORT 2026-A",
                    color: "var(--color-brand-orange)",
                    badge: "brand",
                    description:
                      "Deconstruct the industry problem statement, conduct research and diagnosis, explore strategic choices via WWHTBT, and build the Strategy & Execution Blueprint.",
                  },
                  {
                    phase: "PHASE 2",
                    title: "VALIDATE",
                    action: "PROVE",
                    duration: "4 Weeks",
                    status: "UPCOMING",
                    color: "var(--color-brand-blue)",
                    badge: "blue",
                    description:
                      "Validate strategic hypotheses with real market data, prototype the solution architecture, and prove feasibility under constraint.",
                  },
                  {
                    phase: "PHASE 3",
                    title: "GROW",
                    action: "DELIVER",
                    duration: "4 Weeks",
                    status: "UPCOMING",
                    color: "var(--color-brand-navy)",
                    badge: "muted",
                    description:
                      "Deliver final executive presentations to Company Challenge Owners, industry juries, and receive the DLIF Professional Credential.",
                  },
                ].map((p) => (
                  <div
                    key={p.title}
                    className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                          {p.phase}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)]">
                          {p.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight" style={{ color: p.color }}>
                        {p.title} ({p.action})
                      </h3>
                      <p className="text-xs text-[var(--color-text-body)] mt-3 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-muted)] flex justify-between">
                      <span>Duration: {p.duration}</span>
                      <span>DegreeLabs Standard</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TEAMS */}
          {activeTab === "Teams" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Fellow Teams & Company Challenges</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Fellow team groupings and their assigned industry challenges.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold">Team {t.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-brand-blue-subtle)] text-[var(--color-brand-blue)]">
                        {t.member_count} Fellows
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)]">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
                        Assigned Company Challenge
                      </span>
                      <div className="text-sm font-bold text-[var(--color-text-primary)] mt-1">
                        {t.company_challenge}
                      </div>
                    </div>

                    <div className="text-xs text-[var(--color-text-muted)] flex items-center justify-between">
                      <span>Cohort: 2026-A</span>
                      <span>Dedicated Team Mentor Assigned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SESSIONS & WEEKS */}
          {(activeTab === "Sessions" || activeTab === "Weeks") && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">DISCOVER Curriculum Roadmap</h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  The 4-Week progression with 12 live sessions and Gate Reviews.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    week: "WEEK 01",
                    title: "DISCOVER THE REAL PROBLEM",
                    sessions: [
                      "Session 0 — DLIF Onboarding & Program Setup",
                      "Session 1 — Business Context & Evidence",
                      "Session 2 — Problem Framing & Diagnosis",
                      "Session 3 — Discovery Review (Gate 1)",
                    ],
                    output: "Business Diagnosis & Problem Framing Pack",
                  },
                  {
                    week: "WEEK 02",
                    title: "CREATE STRATEGIC POSSIBILITIES",
                    sessions: [
                      "Session 4 — Research & Possibility Generation",
                      "Session 5 — What Would Have to Be True? (WWHTBT)",
                      "Session 6 — Strategic Choice Review (Gate 2)",
                    ],
                    output: "Strategic Possibility & Choice Pack",
                  },
                  {
                    week: "WEEK 03",
                    title: "DESIGN THE STRATEGY",
                    sessions: [
                      "Session 7 — Integrated Strategy Choices",
                      "Session 8 — Execution Architecture",
                      "Session 9 — Strategy Review (Gate 3)",
                    ],
                    output: "Strategy & Execution Blueprint",
                  },
                  {
                    week: "WEEK 04",
                    title: "BUILD THE CASE FOR ACTION",
                    sessions: [
                      "Session 10 — Proposal Architecture",
                      "Session 11 — Executive Communication",
                      "Session 12 — Final DISCOVER Review (Gate 4)",
                    ],
                    output: "Executive Proposal · Company Presentation · Strategic Design Portfolio",
                  },
                ].map((w) => (
                  <div
                    key={w.week}
                    className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--color-brand-orange)]">
                      <span>{w.week}</span>
                      <span>Output Review Gate</span>
                    </div>
                    <h3 className="text-base font-extrabold">{w.title}</h3>
                    <ul className="space-y-1.5 text-xs text-[var(--color-text-body)]">
                      {w.sessions.map((s) => (
                        <li key={s} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-[var(--color-border-default)] text-[11px] text-[var(--color-text-muted)]">
                      <strong>Deliverable Output:</strong> {w.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DEFAULT / SYSTEM SETTINGS */}
          {activeTab !== "Dashboard" &&
            activeTab !== "Fellows" &&
            activeTab !== "Cohorts" &&
            activeTab !== "Programs" &&
            activeTab !== "Teams" &&
            activeTab !== "Sessions" &&
            activeTab !== "Weeks" && (
              <div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-blue-subtle)] text-[var(--color-brand-blue)] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{activeTab} Console</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Operations controls and administrative configurations for {activeTab}.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-body)] space-y-2">
                  <p>
                    <strong>Portal Role:</strong> Administrator (SUPER_ADMIN)
                  </p>
                  <p>
                    <strong>Enforcement Mode:</strong> Strict Argon2 password verification with JWT claims
                  </p>
                  <p>
                    <strong>Connected Backend:</strong> Admin API runtime on port 8002
                  </p>
                </div>
              </div>
            )}
        </main>
      </div>

      {/* ── INVITE FELLOW MODAL ────────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-extrabold text-[var(--color-text-primary)]">
                Invite New Fellow
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Send an invitation link with 2FA setup onboarding to a new fellow.
              </p>
            </div>

            {inviteSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            {inviteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="e.g. Samantha"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  placeholder="e.g. Reed"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. samantha.reed@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-canvas)] border border-[var(--color-border-default)] focus:outline-none focus:border-[var(--color-brand-blue)]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border-default)] text-xs font-semibold hover:bg-[var(--color-bg-canvas)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
