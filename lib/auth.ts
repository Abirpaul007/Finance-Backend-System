// import jwt from "jsonwebtoken";
// import { User } from "@prisma/client";

// const SECRET = process.env.JWT_SECRET || "supersecret";

// export function generateToken(user: User) {
//   return jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     SECRET,
//     { expiresIn: "1h" }
//   );
// }

// export function verifyToken(token: string) {
//   try {
//     return jwt.verify(token, SECRET);
//   } catch {
//     return null;
//   }
// }

import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

// Define the payload type we expect in the JWT
export interface JwtUserPayload {
  id: number;
  email: string;
  role: "VIEWER" | "ANALYST" | "ADMIN";
}

const SECRET = process.env.JWT_SECRET || "supersecret";

// Generate token from User
export function generateToken(user: User) {
  const payload: JwtUserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

// Verify token and return typed payload or null
export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    // Type assertion to our payload type
    return decoded as JwtUserPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

