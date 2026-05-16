import bcrypt from "bcryptjs";

const PIN_SALT_ROUNDS = 12;

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, PIN_SALT_ROUNDS);
}

export async function verifyPin(pin: string, pinHash: string) {
  return bcrypt.compare(pin, pinHash);
}

export function normalizeClientLogin(value: string) {
  return value.trim().toLowerCase();
}
