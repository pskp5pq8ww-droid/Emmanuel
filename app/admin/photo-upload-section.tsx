"use client";

import { useActionState } from "react";
import { uploadGalleryPhotos, type UploadState } from "./actions";

type Props = {
  galleryId: string;
  gallerySlug: string;
  galleryTitle: string;
  clientName: string;
};

const initialState: UploadState = { ok: false, message: "" };

export default function PhotoUploadSection({ galleryId, gallerySlug, galleryTitle, clientName }: Props) {
  const boundAction = uploadGalleryPhotos.bind(null, galleryId, gallerySlug) as unknown as (
    prevState: UploadState,
    formData: FormData,
  ) => Promise<UploadState>;

  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <div
      className="admin-card"
      style={{ padding: 24, marginTop: 16, borderLeft: "3px solid #22c55e" }}
    >
      <div className="kicker" style={{ color: "#22c55e" }}>Galeria lista</div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Subir fotos</h2>
      <p style={{ marginBottom: 4 }}>
        <strong>{galleryTitle}</strong> — {clientName}
      </p>
      <p style={{ marginBottom: 16, opacity: 0.6, fontSize: 13 }}>
        Slug: /gallery/{gallerySlug}
      </p>

      <form action={action}>
        <div className="field">
          <label htmlFor="photos">Seleccionar imágenes</label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            required
            style={{ padding: "8px 0" }}
          />
          <small style={{ opacity: 0.6 }}>
            Se guardarán en: client-galleries/{gallerySlug}/originals/
          </small>
        </div>
        <button
          className="primary-btn"
          type="submit"
          disabled={pending}
          style={{ marginTop: 8 }}
        >
          {pending ? "Subiendo..." : "Upload photos"}
        </button>
      </form>

      {state.message && (
        <div style={{ marginTop: 12 }}>
          <p className={state.ok ? "message" : "message error"}>{state.message}</p>
          {state.errors?.map((err, i) => (
            <p key={i} className="message error" style={{ fontSize: 12 }}>
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
