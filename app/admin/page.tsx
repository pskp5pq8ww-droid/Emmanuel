import { redirect } from "next/navigation";
import CreateGalleryForm from "./create-gallery-form";
import { hasAdminSession } from "../../src/lib/admin-auth/session";
import { createSupabaseAdminClient } from "../../src/lib/supabase/admin";

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin-login");

  const supabase = createSupabaseAdminClient();
  const { data: galleries } = await supabase
    .from("galleries")
    .select("id,title,slug,is_active,created_at,clients(name,email,username)")
    .order("created_at", { ascending: false })
    .limit(20);

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
                <h2>Create client gallery</h2>
              </div>
              <p>Client PINs are hashed server-side before saving.</p>
            </div>
            <div className="admin-grid">
              <div className="project-list">
                {galleries?.length ? galleries.map((gallery: any) => (
                  <article className="project-card" key={gallery.id}>
                    <header>
                      <div>
                        <h3>{gallery.title}</h3>
                        <p>{gallery.clients?.name || "Client"} · /gallery/{gallery.slug}</p>
                      </div>
                      <span className="chip">{gallery.is_active ? "Active" : "Inactive"}</span>
                    </header>
                  </article>
                )) : <div className="empty">No galleries yet.</div>}
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
