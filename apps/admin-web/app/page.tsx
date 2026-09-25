/**
 * Admin Portal — Home (Phase A Shell)
 * Placeholder landing page. Phase E will implement full Admin UI.
 */

export default function AdminHomePage() {
  const navSections = [
    { label: "OVERVIEW", items: ["Dashboard"] },
    { label: "PEOPLE", items: ["Fellows", "Mentors", "Program Managers"] },
    { label: "PROGRAM", items: ["Programs", "Cohorts", "Weeks", "Sessions"] },
    { label: "LEARNING", items: ["Resources", "Weekly Outputs", "Submissions"] },
    { label: "COLLABORATION", items: ["Teams", "Companies", "Challenges"] },
    { label: "OPERATIONS", items: ["Attendance", "Notifications"] },
    { label: "SYSTEM", items: ["Settings", "Audit Logs"] },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-bg-canvas)", fontFamily: "var(--font-sans)" }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "var(--color-brand-navy)",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3877F9, #3CA3FA)",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 16, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            DegreeLabs
          </span>
        </div>

        {/* Admin badge */}
        <div style={{ padding: "0 20px 20px" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Administration
          </span>
        </div>

        {/* Nav sections */}
        {navSections.map((section) => (
          <div key={section.label} style={{ marginBottom: 8 }}>
            <div
              style={{
                padding: "6px 20px",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => (
              <div
                key={item}
                style={{
                  padding: "8px 20px",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  borderRadius: 8,
                  margin: "1px 8px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header
          style={{
            borderBottom: "1px solid var(--color-border-default)",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--color-bg-canvas)",
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Administration Portal
          </h1>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-brand-orange)",
              background: "var(--color-brand-orange-subtle)",
              borderRadius: "var(--radius-badge)",
              padding: "4px 10px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Phase A
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="text-center max-w-xl">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--color-brand-orange-subtle)",
                color: "var(--color-brand-orange)",
                borderRadius: "var(--radius-pill)",
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.03em",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--color-brand-orange)",
                  display: "inline-block",
                }}
              />
              ADMIN PORTAL · Phase A
            </div>

            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              Admin Portal
              <br />
              <span
                style={{
                  fontFamily: "var(--font-serif-accent)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--color-brand-orange)",
                }}
              >
                shell confirmed
              </span>
            </h2>

            <p
              style={{
                fontSize: 16,
                color: "var(--color-text-body)",
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Running on{" "}
              <strong style={{ color: "var(--color-text-secondary)" }}>
                http://localhost:3002
              </strong>
              . Full admin functionality (Fellows, programs, cohorts, sessions, weekly outputs) will
              be built in Phase E.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                textAlign: "left",
              }}
            >
              {[
                { icon: "🎓", label: "Fellow API", value: "http://localhost:8000" },
                { icon: "👨‍🏫", label: "Mentor API", value: "http://localhost:8001" },
                { icon: "⚙️", label: "Admin API", value: "http://localhost:8002" },
                { icon: "🗄️", label: "Database", value: "Shared PostgreSQL" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-default)",
                    borderRadius: "var(--radius-card-sm)",
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {item.icon}{" "}
                  <strong style={{ color: "var(--color-text-body)" }}>{item.label}:</strong>
                  <br />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
