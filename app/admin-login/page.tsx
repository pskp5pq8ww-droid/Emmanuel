import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { hasAdminSession } from "../../src/lib/admin-auth/session";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        background: "#f9f9f9",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
        <img
          src="/assets/ogo-er-black.png"
          alt="Emmanuel Rojas"
          style={{ width: 56, marginBottom: 28, opacity: 0.85 }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: "#111" }}>
          Admin access
        </h1>
        <p style={{ color: "#666", marginBottom: 28, fontSize: 14 }}>
          Ingresa tus credenciales para acceder al dashboard.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LoginForm />
        </div>
        <p style={{ marginTop: 32 }}>
          <a href="/" style={{ color: "#666", fontSize: 13, textDecoration: "underline" }}>
            Volver al inicio
          </a>
        </p>
      </div>
    </main>
  );
}
