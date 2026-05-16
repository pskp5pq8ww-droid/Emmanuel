"use client";

import { useActionState } from "react";
import { createClientGallery, type AdminCreateState } from "./actions";
import PhotoUploadSection from "./photo-upload-section";

const initialState: AdminCreateState = { ok: false, message: "" };

export default function CreateGalleryForm() {
  const [state, action, pending] = useActionState(createClientGallery, initialState);

  return (
    <>
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
          <label htmlFor="pin">Client PIN</label>
          <input id="pin" name="pin" type="password" inputMode="numeric" placeholder="4827" required />
        </div>
        <div className="field">
          <label htmlFor="title">Gallery title</label>
          <input id="title" name="title" placeholder="Wedding - Maria & John" required />
        </div>
        <div className="field">
          <label htmlFor="event_date">Event date</label>
          <input id="event_date" name="event_date" type="date" />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" placeholder="Optional session notes" />
        </div>
        <div className="field">
          <label htmlFor="is_active">Status</label>
          <select id="is_active" name="is_active" defaultValue="active">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button className="primary-btn" type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create client gallery"}
        </button>
        {state.message ? (
          <p className={state.ok ? "message" : "message error"}>{state.message}</p>
        ) : null}
      </form>

      {state.ok && state.gallery ? (
        <PhotoUploadSection
          galleryId={state.gallery.id}
          gallerySlug={state.gallery.slug}
          galleryTitle={state.gallery.title}
          clientName={state.gallery.clientName}
        />
      ) : null}
    </>
  );
}
