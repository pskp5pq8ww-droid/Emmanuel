"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { ADMIN_PIN_HASH, ADMIN_USERNAME } from "../../src/lib/admin-auth/config";
import { setAdminSession } from "../../src/lib/admin-auth/session";

export type LoginState = { ok: boolean; message: string };

export async function adminLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const pin = String(formData.get("pin") || "").trim();

  if (!username || !pin) {
    return { ok: false, message: "Username y PIN son obligatorios." };
  }
  if (username !== ADMIN_USERNAME) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  const valid = await bcrypt.compare(pin, ADMIN_PIN_HASH);
  if (!valid) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  await setAdminSession();
  redirect("/admin");
}
