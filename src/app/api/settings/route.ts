import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("GET /api/settings failed:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body as { key: string; value: unknown };

    const stringValue = typeof value === "string" ? value : JSON.stringify(value);

    await db
      .insert(settings)
      .values({ key, value: stringValue })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: stringValue },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/settings failed:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
