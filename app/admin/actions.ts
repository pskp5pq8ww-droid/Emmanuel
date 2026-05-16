"use server";

import { revalidatePath } from "next/cache";
import { createGallerySlug } from "../../src/lib/galleries/slug";
import { hashPin } from "../../src/lib/security/pin";
import { createSupabaseAdminClient } from "../../src/lib/supabase/admin";
import { getMissingSupabaseEnv, logSupabaseEnvStatus } from "../../src/lib/supabase/env";
import type { Database } from "../../src/lib/supabase/types";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type GalleryInsert = Database["public"]["Tables"]["galleries"]["Insert"];
type ImageInsert = Database["public"]["Tables"]["gallery_images"]["Insert"];

export type AdminCreateState = {
  ok: boolean;
  message: string;
  gallery?: {
    id: string;
    slug: string;
    title: string;
    clientName: string;
  };
};

export type UploadState = {
  ok: boolean;
  message: string;
  uploaded?: number;
  errors?: string[];
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function createClientGallery(
  _prevState: AdminCreateState,
  formData: FormData,
): Promise<AdminCreateState> {
  try {
    const name = value(formData, "name");
    const email = value(formData, "email").toLowerCase();
    const username = value(formData, "username").toLowerCase();
    const pin = value(formData, "pin");
    const title = value(formData, "title");
    const eventDate = value(formData, "event_date");
    const description = value(formData, "description");
    const isActive = value(formData, "is_active") !== "inactive";

    if (!name || !pin || !title || (!email && !username)) {
      return { ok: false, message: "Completa nombre, PIN, titulo y email o username." };
    }

    if (pin.length < 4) {
      return { ok: false, message: "El PIN debe tener al menos 4 caracteres." };
    }

    const missingEnv = getMissingSupabaseEnv(true);
    if (missingEnv.length) {
      logSupabaseEnvStatus("create-client-gallery", true);
      return { ok: false, message: `Missing environment variables: ${missingEnv.join(", ")}` };
    }

    const supabase = createSupabaseAdminClient();
    let clientId: string | null = null;
    let clientName = name;

    if (email) {
      const { data } = await supabase.from("clients").select("id,name").eq("email", email).maybeSingle();
      if (data) { clientId = data.id; clientName = data.name; }
    }

    if (!clientId && username) {
      const { data } = await supabase.from("clients").select("id,name").eq("username", username).maybeSingle();
      if (data) { clientId = data.id; clientName = data.name; }
    }

    if (!clientId) {
      const pinHash = await hashPin(pin);
      const clientPayload: ClientInsert = {
        name,
        email: email || null,
        username: username || null,
        pin_hash: pinHash,
      };

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert(clientPayload)
        .select("id")
        .single();

      if (clientError || !client) {
        return { ok: false, message: clientError?.message || "No se pudo crear el cliente." };
      }

      clientId = client.id;
      clientName = name;
    }

    const baseSlug = createGallerySlug(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const galleryPayload: GalleryInsert = {
      client_id: clientId,
      title,
      slug,
      event_date: eventDate || null,
      description: description || null,
      is_active: isActive,
    };

    const { data: gallery, error: galleryError } = await supabase
      .from("galleries")
      .insert(galleryPayload)
      .select("id")
      .single();

    if (galleryError || !gallery) {
      return { ok: false, message: galleryError?.message || "No se pudo crear la galeria." };
    }

    revalidatePath("/admin");
    return {
      ok: true,
      message: `Galeria creada. Ruta: /gallery/${slug}`,
      gallery: { id: gallery.id, slug, title, clientName },
    };
  } catch (error) {
    console.error("[createClientGallery] Supabase action error", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error inesperado creando la galeria.",
    };
  }
}

export async function uploadGalleryPhotos(
  galleryId: string,
  gallerySlug: string,
  _prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  try {
    const missingEnv = getMissingSupabaseEnv(true);
    if (missingEnv.length) {
      return { ok: false, message: `Missing environment variables: ${missingEnv.join(", ")}` };
    }

    const files = formData.getAll("photos") as File[];
    const validFiles = files.filter((f) => f instanceof File && f.size > 0);

    if (!validFiles.length) {
      return { ok: false, message: "Selecciona al menos una imagen." };
    }

    const supabase = createSupabaseAdminClient();
    const uploaded: string[] = [];
    const errors: string[] = [];

    for (const file of validFiles) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${gallerySlug}/originals/${timestamp}-${safeName}`;

      const bytes = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("client-galleries")
        .upload(storagePath, bytes, { contentType: file.type || "image/jpeg", upsert: false });

      if (uploadError) {
        errors.push(`${file.name}: ${uploadError.message}`);
        continue;
      }

      const imageInsert: ImageInsert = {
        gallery_id: galleryId,
        storage_path: storagePath,
        filename: file.name,
        size: file.size,
        thumbnail_path: null,
        width: null,
        height: null,
      };

      const { error: metaError } = await supabase.from("gallery_images").insert(imageInsert);
      if (metaError) {
        errors.push(`Metadata ${file.name}: ${metaError.message}`);
      } else {
        uploaded.push(file.name);
      }
    }

    revalidatePath("/admin");

    if (uploaded.length === 0) {
      return { ok: false, message: "No se subio ninguna imagen.", errors };
    }

    return {
      ok: true,
      message: `${uploaded.length} imagen${uploaded.length !== 1 ? "es" : ""} subida${uploaded.length !== 1 ? "s" : ""} correctamente.`,
      uploaded: uploaded.length,
      errors: errors.length ? errors : undefined,
    };
  } catch (error) {
    console.error("[uploadGalleryPhotos] error", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error inesperado subiendo fotos.",
    };
  }
}
