import { NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import path from "path";

export const runtime = "nodejs";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filepath: string[] }> },
) {
  const { filepath } = await params;
  const safeSegments = filepath.filter((s) => s && !s.includes("..") && !s.startsWith("."));

  if (safeSegments.length !== filepath.length) {
    return NextResponse.json({ ok: false, message: "Invalid path" }, { status: 400 });
  }

  const full = path.join(UPLOADS_ROOT, ...safeSegments);

  // Resolve and confirm the path is still inside UPLOADS_ROOT
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(UPLOADS_ROOT))) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const stat = statSync(resolved);
    if (!stat.isFile()) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    const stream = createReadStream(resolved);
    return new NextResponse(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
}
