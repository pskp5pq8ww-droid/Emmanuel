"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "./actions";

const initialState: LoginState = { message: "" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initialState);

  return (
    <form action={action}>
      <div className="field">
        <label htmlFor="username">Admin user</label>
        <input id="username" name="username" placeholder="emma" required />
      </div>
      <div className="field">
        <label htmlFor="pin">PIN</label>
        <input id="pin" name="pin" type="password" placeholder="Enter PIN" required />
      </div>
      <button className="primary-btn" type="submit" disabled={pending}>
        {pending ? "Checking..." : "Enter admin"}
      </button>
      {state.message ? <p className="message error">{state.message}</p> : null}
    </form>
  );
}
