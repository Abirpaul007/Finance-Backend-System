import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import type { JwtUserPayload } from "./auth";

export async function getUser(): Promise<JwtUserPayload | null> {
  const cookieStore = await cookies(); // await because cookies() is async
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return verifyToken(token);
}