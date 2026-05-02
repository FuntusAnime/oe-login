export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "oe.json");

export async function GET() {
  try {
    let data = [];

    try {
      const file = await fs.readFile(filePath, "utf-8");
      data = JSON.parse(file);
    } catch {
      data = [];
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch OE" },
      { status: 500 }
    );
  }
}