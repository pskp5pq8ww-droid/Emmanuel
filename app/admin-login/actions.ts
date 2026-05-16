"use server";

import { redirect } from "next/navigation";
import { ADMIN_PIN_HASH, ADMIN_USERNAME } from "../../src/lib/admin-auth/config";
import { setAdminSession } from "../../src/lib/admin-auth/session";
import { verifyPin } from "../../src/lib/security/pin";

export type LoginState = { message: string };

export async function adminLogin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const pin = String(formData.get("pin") || "").trim();

  if (username !== ADMIN_USERNAME || !(await verifyPin(pin, ADMIN_PIN_HASH))) {
    return { message: "Usuario o PIN incorrecto." };
  }

  await setAdminSession();
  redirect("/admin");
}
