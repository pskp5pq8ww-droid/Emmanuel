"use client";

import { useActionState } from "react";
import { createClientGallery, type CreateState } from "./actions";
import PhotoUploadForm from "./photo-upload-form";

const initial: CreateState = { ok: false, message: "" };

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 14,
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#666",
  marginBottom: 4,
};

export default function CreateGalleryForm() {
  const [state, action, pending] = useActionState(createClientGallery, initial);

  return (
    <>
      <form action={action} style={{ display: "grid", gap: 14 }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Client name *</label>
          <input id="name" name="name" required placeholder="Maria & John" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" name="email" type="email" placeholder="client@email.com" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="username" style={labelStyle}>Username</label>
          <input id="username" name="username" placeholder="mariajohn" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="pin" style={labelStyle}>Client PIN *</label>
          <input id="pin" name="pin" type="password" inputMode="numeric" required placeholder="4827" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="title" style={labelStyle}>Gallery title *</label>
          <input id="title" name="title" required placeholder="Wedding — Maria & John" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="event_date" style={labelStyle}>Event date</label>
          <input id="event_date" name="event_date" type="date" style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" name="description" rows={3} placeholder="Notas opcionales" style={{ ...fieldStyle, resize: "vertical" }} />
        </div>
        <div>
          <label htmlFor="is_active" style={labelStyle}>Status</label>
          <select id="is_active" name="is_active" defaultValue="active" style={fieldStyle}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
          {pending ? "Creando..." : "Create client gallery"}
        </button>
        {state.message ? (
          <p style={{ color: state.ok ? "#16a34a" : "#dc2626", fontSize: 13, margin: 0 }}>
            {state.message}
          </p>
        ) : null}
      </form>

      {state.ok && state.gallery ? (
        <PhotoUploadForm
          galleryId={state.gallery.id}
          gallerySlug={state.gallery.slug}
          galleryTitle={state.gallery.title}
          clientName={state.gallery.clientName}
        />
      ) : null}
    </>
  );
}
