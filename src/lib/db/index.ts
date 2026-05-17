import { promises as fs } from "fs";
import path from "path";
import type { DBShape } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const EMPTY: DBShape = {
  clients: [],
  galleries: [],
  galleryImages: [],
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readDB(): Promise<DBShape> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DBShape>;
    return {
      clients: parsed.clients ?? [],
      galleries: parsed.galleries ?? [],
      galleryImages: parsed.galleryImages ?? [],
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...EMPTY };
    }
    throw err;
  }
}

export async function writeDB(db: DBShape): Promise<void> {
  await ensureDataDir();
  const tmp = `${DB_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(tmp, DB_FILE);
}

export function newId(): string {
  return crypto.randomUUID();
}
