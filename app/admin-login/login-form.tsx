"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "./actions";

const initialState: LoginState = { ok: false, message: "" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initialState);

  return (
    <form action={action} style={{ display: "grid", gap: 14, maxWidth: 320, width: "100%" }}>
      <div>
        <label htmlFor="username" style={{ fontSize: 12, color: "#666" }}>
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 6 }}
        />
      </div>
      <div>
        <label htmlFor="pin" style={{ fontSize: 12, color: "#666" }}>
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          required
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 6 }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        style={{
          background: "#111",
          color: "#fff",
          border: "none",
          padding: "12px 16px",
          borderRadius: 6,
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
      {state.message ? (
        <p style={{ color: state.ok ? "#16a34a" : "#dc2626", fontSize: 13 }}>{state.message}</p>
      ) : null}
    </form>
  );
}
