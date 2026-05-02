export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "users.json");

const SUPER_ADMIN_USER = "Vibes151203";
const SUPER_ADMIN_PASSWORD = "nightmare123#";

type UserItem = {
  userId: string;
  password: string;
  active: boolean;
  createdAt: string;
};

async function readUsers(): Promise<UserItem[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const password = String(body.password || "").trim();

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: "User ID and password are required" },
        { status: 400 }
      );
    }

    if (
      userId === SUPER_ADMIN_USER &&
      password === SUPER_ADMIN_PASSWORD
    ) {
      return NextResponse.json({
        success: true,
        role: "superadmin",
        userId,
      });
    }

    const users = await readUsers();

    const matchedUser = users.find(
      (user) => user.userId === userId && user.password === password
    );

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: "Invalid User ID or password" },
        { status: 401 }
      );
    }

    if (!matchedUser.active) {
      return NextResponse.json(
        { success: false, error: "This user is deactivated" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      role: "user",
      userId: matchedUser.userId,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}