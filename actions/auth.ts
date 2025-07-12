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

export const signinWithOAuth = async ({
  email,
  oauthType,
}: {
  email: string;
  oauthType: "github" | "google";
}) => {
  const match = await db.query.users.findFirst({
    where: eq(usersTable.email, email),
  });
  if (!match) {
    // create user
    const user = await db
      .insert(usersTable)
      .values({
        email,
        oauthType,
        password: "NO_PASSWORD_SINCE_OAUTH",
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        oauthType: usersTable.oauthType,
      });
    const theUser = user[0];
    const token = createTokenForUser(theUser.id);
    return { user: theUser, token };
  }

  if (!match?.oauthType) {
    throw new Error("invalid user, already signed up with email");
  }

  if (match.oauthType !== oauthType) {
    throw new Error("invalid user, already signed up with different oauth");
  }

  const token = createTokenForUser(match.id);
  return {
    user: {
      id: match.id,
      email: match.email,
      oauthType: match.oauthType,
    },
    token,
  };
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

  if (match.oauthType) {
    throw new Error("invalid user, already signed up with oauth");
  }

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
