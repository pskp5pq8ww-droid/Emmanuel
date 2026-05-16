export default function AdminLoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        background: "#f9f9f9",
      }}
    >
      <div style={{ textAlign: "center", padding: 48 }}>
        <img
          src="/assets/ogo-er-black.png"
          alt="Emmanuel Rojas"
          style={{ width: 64, marginBottom: 32, opacity: 0.8 }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: "#111" }}>
          Acceso temporalmente deshabilitado
        </h1>
        <p style={{ color: "#666", maxWidth: 340, margin: "0 auto 28px" }}>
          El panel de administración estará disponible próximamente.
        </p>
        <a
          href="/"
          style={{ color: "#111", fontSize: 14, textDecoration: "underline" }}
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
