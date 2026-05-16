import { redirect } from "next/navigation";
import CreateGalleryForm from "./create-gallery-form";
import { hasAdminSession } from "../../src/lib/admin-auth/session";
import { createSupabaseAdminClient } from "../../src/lib/supabase/admin";
import { getMissingSupabaseEnv } from "../../src/lib/supabase/env";

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

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin-login");

  const missingEnv = getMissingSupabaseEnv(true);
  let dashboardError = "";
  let galleries: GalleryRow[] = [];
  let totalClients = 0;
  let totalGalleries = 0;

  if (missingEnv.length) {
    dashboardError = `Missing environment variables: ${missingEnv.join(", ")}`;
  } else {
    try {
      const supabase = createSupabaseAdminClient();
      const [clientsCount, galleriesCount, galleriesResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("galleries").select("id", { count: "exact", head: true }),
        supabase
          .from("galleries")
          .select("id,title,slug,event_date,description,is_active,created_at,clients(name,email,username)")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      totalClients = clientsCount.count ?? 0;
      totalGalleries = galleriesCount.count ?? 0;

      if (galleriesResult.error) {
        dashboardError = galleriesResult.error.message;
      } else {
        galleries = (galleriesResult.data ?? []) as unknown as GalleryRow[];
      }
    } catch (error) {
      dashboardError = error instanceof Error ? error.message : "Unexpected Supabase dashboard error.";
    }
  }

  return (
    <main className="page">
      <header className="topbar">
        <a href="/"><img className="logo-mark" src="/assets/ogo-er-black.png" alt="Emmanuel Rojas ER" /></a>
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

            {dashboardError ? <div className="empty message error">Supabase: {dashboardError}</div> : null}

            <div className="metrics" style={{ marginBottom: 24 }}>
              <div className="metric"><strong>{totalClients}</strong><span>Clients</span></div>
              <div className="metric"><strong>{totalGalleries}</strong><span>Galleries</span></div>
              <div className="metric"><strong>{galleries.filter((g) => g.is_active).length}</strong><span>Active</span></div>
            </div>

            <div className="admin-grid">
              <div className="project-list">
                <div className="kicker">Recent Galleries</div>
                {galleries.length ? galleries.map((gallery) => (
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
                      <a className="ghost-btn" href={`/gallery/${gallery.slug}`}>Open</a>
                      <button className="ghost-btn" type="button" disabled>Edit soon</button>
                    </div>
                  </article>
                )) : <div className="empty">No galleries yet.</div>}
              </div>
              <aside className="admin-card" style={{ padding: 24 }}>
                <div className="kicker">New Gallery</div>
                <h2 style={{ fontSize: 28 }}>Client access</h2>
                <CreateGalleryForm />
              </aside>
            </div>

            <div className="admin-card" style={{ padding: 24, marginTop: 24 }}>
              <div className="kicker">Upload Structure Ready</div>
              <h2 style={{ fontSize: 28 }}>Photo upload</h2>
              <p className="status-line">Next phase: select gallery, upload multiple images to Supabase Storage bucket <strong>client-galleries</strong>, then save metadata in <strong>gallery_images</strong>.</p>
              <div className="empty">Storage path format: client-galleries/{"{gallery_slug}"}/originals/ and thumbs/</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
