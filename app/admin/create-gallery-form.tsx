"use client";

import { useActionState } from "react";
import { createClientGallery, type AdminCreateState } from "./actions";

const initialState: AdminCreateState = { ok: false, message: "" };

export default function CreateGalleryForm() {
  const [state, action, pending] = useActionState(createClientGallery, initialState);

  return (
    <form action={action}>
      <div className="field">
        <label htmlFor="name">Client name</label>
        <input id="name" name="name" placeholder="Maria & John" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="client@email.com" />
      </div>
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" placeholder="mariajohn" />
      </div>
      <div className="field">
        <label htmlFor="pin">Private PIN</label>
        <input id="pin" name="pin" type="password" inputMode="numeric" placeholder="4827" required />
      </div>
      <div className="field">
        <label htmlFor="title">Gallery title</label>
        <input id="title" name="title" placeholder="Wedding - Maria & John" required />
      </div>
      <button className="primary-btn" type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create client gallery"}
      </button>
      {state.message ? <p className={state.ok ? "message" : "message error"}>{state.message}</p> : null}
    </form>
  );
}
