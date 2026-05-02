export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "users.json");

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

async function writeUsers(users: UserItem[]) {
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json({ success: true, users });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load users" },
      { status: 500 }
    );
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

    const users = await readUsers();

    const exists = users.some(
      (user) => user.userId.toLowerCase() === userId.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { success: false, error: "User ID already exists" },
        { status: 400 }
      );
    }

    const newUser: UserItem = {
      userId,
      password,
      active: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    return NextResponse.json({ success: true, user: newUser });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to add user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const users = await readUsers();

    const updatedUsers = users.map((user) =>
      user.userId === userId ? { ...user, active: !user.active } : user
    );

    await writeUsers(updatedUsers);

    return NextResponse.json({ success: true, users: updatedUsers });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const users = await readUsers();
    const filteredUsers = users.filter((user) => user.userId !== userId);

    await writeUsers(filteredUsers);

    return NextResponse.json({ success: true, users: filteredUsers });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}