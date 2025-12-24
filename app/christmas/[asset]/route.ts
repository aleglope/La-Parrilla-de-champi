import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_ASSETS = new Set(["index.html", "style.css", "script.js"]);

const CONTENT_TYPE: Record<string, string> = {
  "index.html": "text/html; charset=utf-8",
  "style.css": "text/css; charset=utf-8",
  "script.js": "application/javascript; charset=utf-8",
};

export async function GET(
  _request: Request,
  { params }: { params: { asset: string } }
) {
  const asset = params.asset;
  if (!ALLOWED_ASSETS.has(asset)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "components", "christmas", asset);

  let content: Buffer;
  try {
    content = await fs.readFile(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", CONTENT_TYPE[asset] ?? "application/octet-stream");
  if (asset === "index.html") {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  } else {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  const body = new Uint8Array(content);
  return new NextResponse(body, { status: 200, headers });
}
