"use server";

import { revalidatePath } from "next/cache";
import { createGallerySlug } from "../../src/lib/galleries/slug";
import { hashPin } from "../../src/lib/security/pin";
import { createSupabaseAdminClient } from "../../src/lib/supabase/admin";
import { getMissingSupabaseEnv, logSupabaseEnvStatus } from "../../src/lib/supabase/env";
import type { Database } from "../../src/lib/supabase/types";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type GalleryInsert = Database["public"]["Tables"]["galleries"]["Insert"];

export type AdminCreateState = {
  ok: boolean;
  message: string;
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

    if (email) {
      const { data } = await supabase.from("clients").select("id").eq("email", email).maybeSingle();
      clientId = data?.id ?? null;
    }

    if (!clientId && username) {
      const { data } = await supabase.from("clients").select("id").eq("username", username).maybeSingle();
      clientId = data?.id ?? null;
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

    const { error: galleryError } = await supabase.from("galleries").insert(galleryPayload);

    if (galleryError) {
      return { ok: false, message: galleryError.message };
    }

    revalidatePath("/admin");
    return { ok: true, message: `Galeria creada. Ruta: /gallery/${slug}` };
  } catch (error) {
    console.error("[createClientGallery] Supabase action error", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error inesperado creando la galeria.",
    };
  }
}
