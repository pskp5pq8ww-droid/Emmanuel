"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newId, readDB, writeDB } from "../../src/lib/db";
import type { Client, Gallery } from "../../src/lib/db/types";
import { createGallerySlug } from "../../src/lib/galleries/slug";
import { hashPin } from "../../src/lib/security/pin";
import { clearAdminSession } from "../../src/lib/admin-auth/session";

export type CreateState = {
  ok: boolean;
  message: string;
  gallery?: { id: string; slug: string; title: string; clientName: string };
};

function v(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

export async function createClientGallery(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  try {
    const name = v(formData, "name");
    const email = v(formData, "email").toLowerCase();
    const username = v(formData, "username").toLowerCase();
    const pin = v(formData, "pin");
    const title = v(formData, "title");
    const eventDate = v(formData, "event_date");
    const description = v(formData, "description");
    const isActive = v(formData, "is_active") !== "inactive";

    if (!name || !pin || !title || (!email && !username)) {
      return { ok: false, message: "Completa nombre, PIN, título y email o username." };
    }
    if (pin.length < 4) {
      return { ok: false, message: "El PIN debe tener al menos 4 caracteres." };
    }

    const db = await readDB();

    // Find existing client by email or username, else create
    let client: Client | undefined;
    if (email) {
      client = db.clients.find((c) => c.email === email);
    }
    if (!client && username) {
      client = db.clients.find((c) => c.username === username);
    }

    if (!client) {
      const pinHash = await hashPin(pin);
      client = {
        id: newId(),
        name,
        email: email || null,
        username: username || null,
        pinHash,
        createdAt: new Date().toISOString(),
      };
      db.clients.push(client);
    }

    const slug = createGallerySlug(title);
    const gallery: Gallery = {
      id: newId(),
      clientId: client.id,
      title,
      slug,
      eventDate: eventDate || null,
      description: description || null,
      isActive,
      createdAt: new Date().toISOString(),
    };
    db.galleries.push(gallery);

    await writeDB(db);
    revalidatePath("/admin");

    return {
      ok: true,
      message: `Galería creada: /gallery/${slug}`,
      gallery: { id: gallery.id, slug, title, clientName: client.name },
    };
  } catch (err) {
    console.error("[createClientGallery] error", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Error inesperado.",
    };
  }
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin-login");
}
