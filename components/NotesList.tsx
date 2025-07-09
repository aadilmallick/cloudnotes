import { notesCacher } from "@/utils/NextJSCaching";
import { notesModel } from "@/utils/sqlite";
import clsx from "clsx";
import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { revalidatePath } from "next/cache";
import { TrashButton } from "./Buttons";
import db from "@/drizzle/db";
import { notesTable } from "@/drizzle/schemas";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { EditNotesForm } from "./NotesForm";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getNotes(userId: string) {
  "use cache";
  notesCacher.cache(userId);
  return await db.query.notes.findMany({
    columns: {
      content: true,
      title: true,
      priority: true,
      id: true,
      createdAt: true,
    },
    where: eq(notesTable.userId, userId),
    orderBy: (notesTable, { desc }) => [desc(notesTable.createdAt)],
  });
  // return await db.select().from(notesTable);
}

export const NotesList = async ({ userId }: { userId: string }) => {
  const notes = await getNotes(userId);
  if (notes.length === 0) {
    return (
      <h2 className="text-center text-2xl font-bold mb-4">No notes found</h2>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex flex-col justify-between space-y-2"
        >
          <span className="text-lg font-bold capitalize">{note.title}</span>
          <div className="flex space-x-4 items-center">
            <p
              className={clsx(
                "py-1 px-3 rounded-4xl text-xs font-bold",
                note.priority === "low" && "bg-green-500/50 text-green-500",
                note.priority === "medium" &&
                  "bg-yellow-500/50 text-yellow-500",
                note.priority === "high" && "bg-red-500/50 text-red-500"
              )}
            >
              {note.priority}
            </p>
            <TrashButton id={note.id} />
            <button
              commandfor="edit-note-form"
              command="show-modal"
              className="bg-blue-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors duration-200 text-base font-semibold"
            >
              Edit
            </button>
            <dialog
              id="edit-note-form"
              className="bg-white p-4 rounded-md left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-sm space-y-4"
            >
              <EditNotesForm note={note} userId={userId} />
              <button
                commandfor="edit-note-form"
                command="close"
                className="bg-red-500 text-white p-2 rounded-md w-full cursor-pointer"
              >
                Close
              </button>
            </dialog>
          </div>
          <p className="text-sm text-gray-500">{note.content}</p>
        </div>
      ))}
    </div>
  );
};
