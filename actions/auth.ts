import "server-only";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { usersTable } from "@/drizzle/schemas";
import db from "@/drizzle/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("no JWT secret specified");

export const JWT_COOKIE_NAME = "nextjsnotes-cookie";

export const createTokenForUser = (userId: string) => {
  const token = jwt.sign({ id: userId }, SECRET);
  return token;
};

export const getUserFromToken = async (token: {
  name: string;
  value: string;
}) => {
  try {
    const payload = jwt.verify(token.value, SECRET) as { id: string };

    const user = await db.query.users.findFirst({
      where: eq(usersTable.id, payload.id),
      columns: {
        id: true,
        email: true,
      },
    });

    return user;
  } catch (e) {
    return null;
  }
};

export const signin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const match = await db.query.users.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!match) throw new Error("invalid user");

  const correctPW = await comparePW(password, match.password);

  if (!correctPW) {
    throw new Error("invalud user");
  }

  const token = createTokenForUser(match.id);
  const { password: pw, ...user } = match;

  return { user, token };
};

export const signup = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const hashedPW = await hashPW(password);
  try {
    const rows = await db
      .insert(usersTable)
      .values({ email, password: hashedPW })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .onConflictDoNothing();

    const user = rows[0];
    const token = createTokenForUser(user.id);

    return { user, token };
  } catch (e) {
    console.error(e);
    throw new Error("user already signed up");
  }
};

export const signout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);
};

export const hashPW = (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePW = (password: string, hashedPW: string) => {
  return bcrypt.compare(password, hashedPW);
};

export const getUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME);
  if (!token) {
    redirect("/signin");
  }
  const user = await getUserFromToken(token);
  console.log("user", user);
  if (!user) {
    redirect("/signin");
  }
  return user;
});
