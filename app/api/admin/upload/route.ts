import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { hasAdminSession } from "../../../../src/lib/admin-auth/session";
import { newId, readDB, writeDB } from "../../../../src/lib/db";
import type { GalleryImage } from "../../../../src/lib/db/types";
import { sanitizeFilename } from "../../../../src/lib/galleries/slug";

export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "galleries");

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const galleryId = String(formData.get("galleryId") || "");
  const files = formData.getAll("photos");

  if (!galleryId) {
    return NextResponse.json({ ok: false, message: "Missing galleryId" }, { status: 400 });
  }

  const db = await readDB();
  const gallery = db.galleries.find((g) => g.id === galleryId);
  if (!gallery) {
    return NextResponse.json({ ok: false, message: "Gallery not found" }, { status: 404 });
  }

  const validFiles = files.filter(
    (f): f is File => f instanceof File && f.size > 0,
  );
  if (!validFiles.length) {
    return NextResponse.json({ ok: false, message: "Selecciona al menos una imagen." }, { status: 400 });
  }

  const galleryDir = path.join(UPLOADS_DIR, gallery.slug);
  await fs.mkdir(galleryDir, { recursive: true });

  const uploaded: string[] = [];
  const errors: string[] = [];

  for (const file of validFiles) {
    try {
      const timestamp = Date.now();
      const safe = sanitizeFilename(file.name);
      const filename = `${timestamp}-${safe}`;
      const target = path.join(galleryDir, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(target, bytes);

      const record: GalleryImage = {
        id: newId(),
        galleryId: gallery.id,
        filename: file.name,
        path: `galleries/${gallery.slug}/${filename}`,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      db.galleryImages.push(record);
      uploaded.push(file.name);
    } catch (err) {
      errors.push(`${file.name}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  await writeDB(db);

  return NextResponse.json({
    ok: uploaded.length > 0,
    uploaded: uploaded.length,
    total: validFiles.length,
    errors: errors.length ? errors : undefined,
  });
}
