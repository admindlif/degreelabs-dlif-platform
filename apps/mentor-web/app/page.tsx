/**
 * Mentor Portal — Home (Phase A Shell)
 * Placeholder landing page. Phase D will implement full Mentor UI.
 */

export default function MentorHomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)", fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <header
        style={{
          borderBottom: "1px solid var(--color-border-default)",
          background: "var(--color-bg-canvas)",
        }}
        className="flex items-center justify-between px-8 py-4"
      >
        <div className="flex items-center gap-3">
          {/* Logo mark placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3877F9, #3CA3FA)",
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "var(--color-brand-navy)",
              letterSpacing: "-0.02em",
            }}
          >
            DegreeLabs
          </span>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-muted)",
            background: "var(--color-bg-subtle)",
            borderRadius: "var(--radius-badge)",
            padding: "4px 10px",
            border: "1px solid var(--color-border-default)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Mentor Portal
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-lg">
          {/* Accent chip */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--color-brand-blue-subtle)",
              color: "var(--color-brand-blue)",
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
                background: "var(--color-brand-blue)",
                display: "inline-block",
              }}
            />
            MENTOR PORTAL · Phase A
          </div>

          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Mentor Portal
            <br />
            <span
              style={{
                fontFamily: "var(--font-serif-accent)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--color-brand-orange)",
              }}
            >
              coming soon
            </span>
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "var(--color-text-body)",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            This is the dedicated Mentor Portal runtime running on{" "}
            <strong style={{ color: "var(--color-text-secondary)" }}>
              http://localhost:3001
            </strong>
            . Full mentor functionality will be built in Phase D.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-card-sm)",
                padding: "12px 20px",
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              🎓 <strong style={{ color: "var(--color-text-body)" }}>API:</strong> http://localhost:8001
            </div>
            <div
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-card-sm)",
                padding: "12px 20px",
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              ✅ <strong style={{ color: "var(--color-text-body)" }}>DB:</strong> Connected (shared PostgreSQL)
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="px-8 py-4 text-center"
        style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-border-default)",
        }}
      >
        DegreeLabs DLIF Platform · Mentor Portal · Phase A
      </footer>
    </div>
  );
}
