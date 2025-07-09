import { getUser } from "@/actions/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotesForm } from "@/components/NotesForm";
import { NotesList } from "@/components/NotesList";
import React, { Suspense } from "react";

const Page = async () => {
  const user = await getUser();
  return (
    <main className="">
      <div className="p-4 w-[90vw] mx-auto pt-8 space-y-4">
        <nav className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <LogoutButton />
            <button
              commandfor="notes-form"
              command="show-modal"
              className="bg-blue-500 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors duration-200 text-base font-semibold"
            >
              Open Notes Form
            </button>
          </div>
        </nav>

        <Suspense fallback={<div>Loading...</div>}>
          <NotesList userId={user.id} />
        </Suspense>
        <dialog
          id="notes-form"
          className="bg-white p-4 rounded-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 min-w-sm"
        >
          <NotesForm userId={user.id} />
          <button
            commandfor="notes-form"
            command="close"
            className="bg-red-500 text-white p-2 rounded-md w-full"
          >
            Close
          </button>
        </dialog>
      </div>
    </main>
  );
};

export default Page;
