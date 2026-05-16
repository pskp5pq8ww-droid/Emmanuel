import { redirect } from "next/navigation";
import CreateGalleryForm from "./create-gallery-form";
import { hasAdminSession } from "../../src/lib/admin-auth/session";
import { createSupabaseAdminClient } from "../../src/lib/supabase/admin";
import {
  getMissingSupabaseEnv,
  getSupabaseEnvStatus,
  logSupabaseEnvStatus,
} from "../../src/lib/supabase/env";

type GalleryRow = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  clients: { name: string; email: string | null; username: string | null } | null;
};

type TestItem = { ok: boolean; label: string; detail?: string };

type ConnectionTest = {
  url: TestItem;
  publicKey: TestItem;
  serviceRole: TestItem;
  dbClients: TestItem;
  dbGalleries: TestItem;
  storageBucket: TestItem;
  storageUpload: TestItem;
};

async function runConnectionTest(): Promise<ConnectionTest> {
  const envStatus = getSupabaseEnvStatus();

  const base: ConnectionTest = {
    url: { ok: envStatus.url, label: "Supabase URL", detail: envStatus.url ? "Set" : "Missing NEXT_PUBLIC_SUPABASE_URL" },
    publicKey: {
      ok: envStatus.publicKey,
      label: "Public key",
      detail: envStatus.publicKey
        ? `Using ${envStatus.publicKeyName}`
        : "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    serviceRole: {
      ok: envStatus.serviceRoleKey,
      label: "Service role key",
      detail: envStatus.serviceRoleKey ? "Set (server-only)" : "Missing SUPABASE_SERVICE_ROLE_KEY",
    },
    dbClients: { ok: false, label: "DB: clients table", detail: "Not tested (env missing)" },
    dbGalleries: { ok: false, label: "DB: galleries table", detail: "Not tested (env missing)" },
    storageBucket: { ok: false, label: "Storage bucket: client-galleries", detail: "Not tested (env missing)" },
    storageUpload: { ok: false, label: "Storage upload test", detail: "Not tested (env missing)" },
  };

  if (!envStatus.url || !envStatus.serviceRoleKey) {
    return base;
  }

  try {
    const supabase = createSupabaseAdminClient();

    // Test clients table
    const { error: clientsErr } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true });
    base.dbClients = clientsErr
      ? { ok: false, label: "DB: clients table", detail: clientsErr.message }
      : { ok: true, label: "DB: clients table", detail: "Readable" };

    // Test galleries table
    const { error: galleriesErr } = await supabase
      .from("galleries")
      .select("id", { count: "exact", head: true });
    base.dbGalleries = galleriesErr
      ? { ok: false, label: "DB: galleries table", detail: galleriesErr.message }
      : { ok: true, label: "DB: galleries table", detail: "Readable" };

    // Test storage bucket list
    const { error: bucketErr } = await supabase.storage.from("client-galleries").list("", { limit: 1 });
    base.storageBucket = bucketErr
      ? { ok: false, label: "Storage bucket: client-galleries", detail: bucketErr.message }
      : { ok: true, label: "Storage bucket: client-galleries", detail: "Accessible" };

    // Test storage upload + delete
    const testPath = `connection-tests/test-${Date.now()}.txt`;
    const testContent = Buffer.from("supabase-connection-test");
    const { error: uploadErr } = await supabase.storage
      .from("client-galleries")
      .upload(testPath, testContent, { contentType: "text/plain", upsert: true });

    if (uploadErr) {
      base.storageUpload = { ok: false, label: "Storage upload test", detail: uploadErr.message };
    } else {
      await supabase.storage.from("client-galleries").remove([testPath]);
      base.storageUpload = { ok: true, label: "Storage upload test", detail: "Upload + delete OK" };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    base.dbClients = { ok: false, label: "DB: clients table", detail: msg };
    base.dbGalleries = { ok: false, label: "DB: galleries table", detail: msg };
    base.storageBucket = { ok: false, label: "Storage bucket: client-galleries", detail: msg };
    base.storageUpload = { ok: false, label: "Storage upload test", detail: msg };
  }

  return base;
}

function StatusRow({ item }: { item: TestItem }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        fontSize: 14,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: item.ok ? "#22c55e" : "#ef4444",
          flexShrink: 0,
        }}
      />
      <span style={{ minWidth: 240, fontWeight: 500 }}>{item.label}</span>
      <span style={{ opacity: 0.6 }}>{item.ok ? "OK" : `Error — ${item.detail}`}</span>
    </div>
  );
}

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin-login");

  const missingEnv = getMissingSupabaseEnv(true);
  let dashboardError = "";
  let galleries: GalleryRow[] = [];
  let totalClients = 0;
  let totalGalleries = 0;
  let totalActive = 0;

  const connTest = await runConnectionTest();

  if (missingEnv.length) {
    logSupabaseEnvStatus("admin-page", true);
    dashboardError = `Missing environment variables: ${missingEnv.join(", ")}`;
  } else {
    try {
      const supabase = createSupabaseAdminClient();
      const [clientsCount, galleriesCount, activeCount, galleriesResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("galleries").select("id", { count: "exact", head: true }),
        supabase.from("galleries").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase
          .from("galleries")
          .select("id,title,slug,event_date,description,is_active,created_at,clients(name,email,username)")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      totalClients = clientsCount.count ?? 0;
      totalGalleries = galleriesCount.count ?? 0;
      totalActive = activeCount.count ?? 0;

      if (galleriesResult.error) {
        dashboardError = galleriesResult.error.message;
      } else {
        galleries = (galleriesResult.data ?? []) as unknown as GalleryRow[];
      }
    } catch (error) {
      console.error("[AdminPage] Supabase dashboard error", error);
      dashboardError = error instanceof Error ? error.message : "Unexpected Supabase dashboard error.";
    }
  }

  const allTestItems = Object.values(connTest);
  const allOk = allTestItems.every((t) => t.ok);

  return (
    <main className="page">
      <header className="topbar">
        <a href="/">
          <img className="logo-mark" src="/assets/ogo-er-black.png" alt="Emmanuel Rojas ER" />
        </a>
        <nav className="nav" aria-label="Admin">
          <a href="/">Home</a>
          <a href="/admin">Admin</a>
        </nav>
        <div />
      </header>

      <section className="admin-section" style={{ display: "block" }}>
        <div className="admin-shell">
          <aside className="sidebar">
            <img className="logo-mark" src="/assets/ogo-er-black.png" alt="ER" />
            <span className="side-link active">Galleries</span>
            <span className="side-link">Upload</span>
            <span className="side-link">Reviews</span>
            <span className="side-link">Settings</span>
          </aside>

          <div className="admin-content">
            <div className="section-head">
              <div>
                <div className="kicker">Private Dashboard</div>
                <h2>Client galleries</h2>
              </div>
              <p>Create private galleries. PINs are hashed server-side before saving.</p>
            </div>

            {/* Supabase Connection Test */}
            <div
              className="admin-card"
              style={{
                padding: 24,
                marginBottom: 24,
                borderLeft: `3px solid ${allOk ? "#22c55e" : "#ef4444"}`,
              }}
            >
              <div className="kicker" style={{ color: allOk ? "#22c55e" : "#ef4444" }}>
                {allOk ? "All systems OK" : "Connection issues detected"}
              </div>
              <h2 style={{ fontSize: 20, marginBottom: 16 }}>Supabase Connection Test</h2>
              {allTestItems.map((item) => (
                <StatusRow key={item.label} item={item} />
              ))}
            </div>

            {dashboardError ? (
              <div className="empty message error">Supabase: {dashboardError}</div>
            ) : null}

            <div className="metrics" style={{ marginBottom: 24 }}>
              <div className="metric">
                <strong>{totalClients}</strong>
                <span>Clients</span>
              </div>
              <div className="metric">
                <strong>{totalGalleries}</strong>
                <span>Galleries</span>
              </div>
              <div className="metric">
                <strong>{totalActive}</strong>
                <span>Active</span>
              </div>
            </div>

            <div className="admin-grid">
              <div className="project-list">
                <div className="kicker">Recent Galleries</div>
                {galleries.length ? (
                  galleries.map((gallery) => (
                    <article className="project-card" key={gallery.id}>
                      <header>
                        <div>
                          <h3>{gallery.title}</h3>
                          <p>
                            {gallery.clients?.name || "Client"}
                            {gallery.clients?.email ? ` · ${gallery.clients.email}` : ""}
                            {gallery.event_date ? ` · ${gallery.event_date}` : ""}
                          </p>
                          {gallery.description ? <p>{gallery.description}</p> : null}
                          <p>/gallery/{gallery.slug}</p>
                        </div>
                        <span className="chip">{gallery.is_active ? "Active" : "Inactive"}</span>
                      </header>
                      <div className="asset-actions">
                        <a className="ghost-btn" href={`/gallery/${gallery.slug}`}>
                          Open
                        </a>
                        <button className="ghost-btn" type="button" disabled>
                          Edit soon
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty">No galleries yet.</div>
                )}
              </div>

              <aside className="admin-card" style={{ padding: 24 }}>
                <div className="kicker">New Gallery</div>
                <h2 style={{ fontSize: 28 }}>Client access</h2>
                <CreateGalleryForm />
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
