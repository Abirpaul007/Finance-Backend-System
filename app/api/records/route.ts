import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

// 🔹 Validation Schema
const recordSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().optional(),
  note: z.string().optional(),
});

//  GET ALL RECORDS
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const records = await prisma.record.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

//  CREATE RECORD (ADMIN ONLY)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    //  Parse body
    const body = await req.json();

    // Validate input
    const parsed = recordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { amount, type, category, date, note } = parsed.data;

    //  Create record
    const record = await prisma.record.create({
      data: {
        amount,
        type,
        category,
        date: date ? new Date(date) : new Date(),
        note,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}