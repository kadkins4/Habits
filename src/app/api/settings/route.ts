import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(settings);
  const result: Record<string, unknown> = {};

  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }

  return NextResponse.json({ settings: result });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { key, value } = body as { key: string; value: unknown };

  const stringValue = typeof value === "string" ? value : JSON.stringify(value);

  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key));

  if (existing.length > 0) {
    await db.update(settings).set({ value: stringValue }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value: stringValue });
  }

  return NextResponse.json({ success: true });
}
