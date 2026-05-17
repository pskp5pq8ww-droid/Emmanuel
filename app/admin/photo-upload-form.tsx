"use client";

import { useState } from "react";

type Props = {
  galleryId: string;
  gallerySlug: string;
  galleryTitle: string;
  clientName: string;
};

type Result = {
  ok: boolean;
  uploaded?: number;
  total?: number;
  errors?: string[];
  message?: string;
};

export default function PhotoUploadForm({
  galleryId,
  gallerySlug,
  galleryTitle,
  clientName,
}: Props) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("galleryId", galleryId);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as Result;
      setResult(data);
      if (data.ok) form.reset();
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Upload falló" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        border: "1px solid #e5e7eb",
        borderLeft: "3px solid #16a34a",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>
        Galería creada
      </p>
      <h3 style={{ margin: "6px 0 4px", fontSize: 18 }}>Subir fotos</h3>
      <p style={{ margin: "0 0 4px", fontSize: 14 }}>
        <strong>{galleryTitle}</strong> — {clientName}
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 12, color: "#666" }}>
        Ruta: /gallery/{gallerySlug}
      </p>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="photos" style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>
            Seleccionar imágenes
          </label>
          <input id="photos" name="photos" type="file" accept="image/*" multiple required />
          <small style={{ display: "block", marginTop: 6, color: "#999", fontSize: 11 }}>
            Se guardan en: uploads/galleries/{gallerySlug}/
          </small>
        </div>
        <button
          type="submit"
          disabled={pending}
          style={{
            background: "#111",
            color: "#fff",
            border: "none",
            padding: "10px 14px",
            borderRadius: 6,
            fontSize: 14,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Subiendo..." : "Upload photos"}
        </button>
      </form>

      {result ? (
        <div style={{ marginTop: 14 }}>
          <p style={{ color: result.ok ? "#16a34a" : "#dc2626", fontSize: 13, margin: 0 }}>
            {result.ok
              ? `${result.uploaded}/${result.total} imágenes subidas`
              : result.message || "Upload falló"}
          </p>
          {result.errors?.map((e, i) => (
            <p key={i} style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}>
              {e}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
