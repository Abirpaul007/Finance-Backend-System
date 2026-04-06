import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// 🔹 Validation schema
const recordSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.string(),
  note: z.string().optional(),
});

// DELETE RECORD
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.record.findUnique({
      where: { id: idNum },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    await prisma.record.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

//  UPDATE RECORD
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //  Parse body
    const body = await req.json();

    //  Validate
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

    const existing = await prisma.record.findUnique({
      where: { id: idNum },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.record.update({
      where: { id: idNum },
      data: {
        amount: parsed.data.amount,
        type: parsed.data.type,
        category: parsed.data.category,
        date: new Date(parsed.data.date),
        note: parsed.data.note,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}