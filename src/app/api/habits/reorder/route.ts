import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { habits } from "@/db/schema";

type ReorderItem = {
  id: string;
  status: string;
  sort_order: number;
};

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: ReorderItem[] };

    for (const item of items) {
      await db
        .update(habits)
        .set({ status: item.status, sort_order: item.sort_order })
        .where(eq(habits.id, item.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/habits/reorder failed:", error);
    return NextResponse.json({ error: "Failed to reorder habits" }, { status: 500 });
  }
}
