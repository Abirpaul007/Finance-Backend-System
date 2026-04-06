import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Record as PrismaRecord } from "@prisma/client";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //  FETCH ALL RECORDS (no user filter)

    const records: PrismaRecord[] = await prisma.record.findMany({
      orderBy: { date: "desc" },
    });


    //  TOTALS
 
    const income = records
      .filter((r) => r.type === "INCOME")
      .reduce((sum, r) => sum + r.amount, 0);

    const expense = records
      .filter((r) => r.type === "EXPENSE")
      .reduce((sum, r) => sum + r.amount, 0);

    const balance = income - expense;


    //  CATEGORY TOTALS

    const categoryMap: Record<string, number> = {};

    records.forEach((r) => {
      if (!categoryMap[r.category]) {
        categoryMap[r.category] = 0;
      }
      categoryMap[r.category] += r.amount;
    });

    const categoryTotals = Object.keys(categoryMap).map((key) => ({
      category: key,
      total: categoryMap[key],
    }));


    // RECENT ACTIVITY

    const recent = records.slice(0, 5);

   
    //  MONTHLY TREND

    const monthlyMap: Record<string, number> = {};

    records.forEach((r) => {
      const month = new Date(r.date).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyMap[month]) {
        monthlyMap[month] = 0;
      }

      monthlyMap[month] += r.amount;
    });

    const monthly = Object.keys(monthlyMap).map((key) => ({
      month: key,
      total: monthlyMap[key],
    }));


    //  RESPONSE

    return NextResponse.json({
      income,
      expense,
      balance,
      categoryTotals,
      recent,
      monthly,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}