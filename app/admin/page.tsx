import { redirect } from "next/navigation";
import { hasAdminSession } from "../../src/lib/admin-auth/session";
import { readDB } from "../../src/lib/db";
import CreateGalleryForm from "./create-gallery-form";
import { adminLogout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin-login");

  const db = await readDB();
  const totalClients = db.clients.length;
  const totalGalleries = db.galleries.length;
  const totalActive = db.galleries.filter((g) => g.isActive).length;
  const totalImages = db.galleryImages.length;

  const recentGalleries = [...db.galleries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30);

  const clientById = new Map(db.clients.map((c) => [c.id, c]));

  return (
    <main style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/assets/ogo-er-black.png" alt="ER" style={{ width: 36 }} />
          <span style={{ fontSize: 14, color: "#666" }}>Admin Dashboard</span>
        </a>
        <form action={adminLogout}>
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid #e5e7eb",
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>Galerías privadas</h1>
        <p style={{ color: "#666", margin: "0 0 28px" }}>
          Crea clientes, sus galerías y sube fotos. Todo se guarda en el servidor.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Clients", value: totalClients },
            { label: "Galleries", value: totalGalleries },
            { label: "Active", value: totalActive },
            { label: "Photos", value: totalImages },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 600 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 400px", gap: 24, alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, color: "#666" }}>
              Recent galleries
            </h2>
            {recentGalleries.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                No hay galerías todavía. Crea una en el formulario →
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {recentGalleries.map((g) => {
                  const client = clientById.get(g.clientId);
                  const imageCount = db.galleryImages.filter((i) => i.galleryId === g.id).length;
                  return (
                    <article
                      key={g.id}
                      style={{
                        background: "#fff",
                        padding: 20,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{g.title}</h3>
                          <p style={{ margin: "0 0 4px", color: "#666", fontSize: 13 }}>
                            {client?.name || "—"}
                            {client?.email ? ` · ${client.email}` : ""}
                            {g.eventDate ? ` · ${g.eventDate}` : ""}
                          </p>
                          {g.description ? (
                            <p style={{ margin: "0 0 6px", color: "#666", fontSize: 13 }}>{g.description}</p>
                          ) : null}
                          <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
                            /gallery/{g.slug} · {imageCount} fotos
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            background: g.isActive ? "#dcfce7" : "#f3f4f6",
                            color: g.isActive ? "#15803d" : "#666",
                            padding: "4px 10px",
                            borderRadius: 999,
                            height: "fit-content",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {g.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              position: "sticky",
              top: 24,
            }}
          >
            <h2 style={{ fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>
              New gallery
            </h2>
            <h3 style={{ fontSize: 20, margin: "0 0 20px" }}>Client + galería</h3>
            <CreateGalleryForm />
          </aside>
        </div>
      </section>
    </main>
  );
}
