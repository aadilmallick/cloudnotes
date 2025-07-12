"use server";
// Stubbed server action - you can implement this yourself
import db from "@/drizzle/db";
import { notesTable } from "@/drizzle/schemas";
import { notesCacher } from "@/utils/NextJSCaching";
import { Note, notesModel } from "@/utils/sqlite";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { JWT_COOKIE_NAME, signin, signout, signup } from "./auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface ActionResponse {
  success: boolean;
  message: string;
  error?: string;
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function addNoteAction(
  formData: FormData,
  userId: string
): Promise<ActionResponse> {
  // TODO: Implement server action
  console.log("Form data:", {
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
  });

  const schema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    priority: z.enum(["low", "medium", "high"]),
    userId: z.string().nonempty(),
  });

  try {
    const requestData = {
      ...formDataToObject(formData),
      userId,
    };
    const data = schema.parse(requestData);
    // notesModel.createNote(data);
    const result = await db
      .insert(notesTable)
      .values({
        ...data,
        createdAt: new Date().toISOString(),
      })
      .returning();
    const createdNote = result[0];
    notesCacher.uncache(userId);
    // revalidatePath("/");
    return { success: true, message: "Note added successfully" };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to add note",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function deleteNoteAction(id: number) {
  await db.delete(notesTable).where(eq(notesTable.id, id));
  revalidatePath("/");
}

const editNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});

export async function editNoteAction(
  formData: FormData,
  userId: string,
  notesId: number
) {
  // TODO: Implement editNoteAction
  try {
    const requestData = formDataToObject(formData);
    const data = editNoteSchema.parse(requestData);
    const result = await db
      .update(notesTable)
      .set({
        ...data,
      })
      .where(
        and(eq(notesTable.id, Number(notesId)), eq(notesTable.userId, userId))
      )
      .returning();
    const updatedNote = result[0];
    notesCacher.uncache(userId);
    return { success: true, message: "Note updated successfully" };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to update note",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

const authSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerUserAction(formData: FormData) {
  try {
    const { email, password } = authSchema.parse(formDataToObject(formData));
    const res = await signup({
      email,
      password,
    });
    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE_NAME, res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } catch (e) {
    console.error(e);
    redirect(
      `/signup?payload=${encodeURIComponent(
        JSON.stringify({
          error: (e as any).message || "error signing up",
        })
      )}`
    );
    // return {
    //   message: "Registering the user failed",
    //   success: false,
    //   error: (e as any).message || "unknown error",
    // };
  }

  const response = {
    message: "successfully signed up",
    success: true,
  };
  redirect(
    `/dashboard?payload=${encodeURIComponent(JSON.stringify(response))}`
  );
  // return response;
}

export async function logoutAction() {
  await signout();
  redirect("/signin");
}

export async function signInAction(formData: FormData) {
  try {
    const { email, password } = authSchema.parse(formDataToObject(formData));
    const res = await signin({
      email,
      password,
    });
    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE_NAME, res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } catch (e) {
    console.error(e);
    // return {
    //   message: "signing in the user failed",
    //   success: false,
    //   error: (e as any).message || "unknown error",
    // };
    redirect(
      `/signin?payload=${encodeURIComponent(
        JSON.stringify({
          error: (e as any).message || "error signing in",
        })
      )}`
    );
  }

  const response = {
    message: "successfully signed in",
    success: true,
  };
  redirect(
    `/dashboard?payload=${encodeURIComponent(JSON.stringify(response))}`
  );
  // return response;
}
