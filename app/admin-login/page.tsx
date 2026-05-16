import LoginForm from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="page">
      <section className="portal-row" id="portal">
        <div className="login-panel">
          <img className="logo-mark" src="/assets/ogo-er-black.png" alt="ER" style={{ width: 52, marginBottom: 28 }} />
          <div className="kicker">Admin Access</div>
          <h2>Private Dashboard</h2>
          <p>Enter your admin credentials.</p>
          <LoginForm />
        </div>
        <div className="brand-panel">
          <div className="device-card"><img className="logo-mark" src="/assets/ogo-er-black.png" alt="ER" /></div>
        </div>
      </section>
    </main>
  );
}
