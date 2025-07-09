"use client";

import { deleteNoteAction } from "@/actions/actions";
import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

export const TrashButton = ({ id }: { id: number }) => {
  const router = useRouter();
  return (
    <button
      className="text-sm text-gray-500 hover:text-red-500 cursor-pointer"
      onClick={async () => {
        await deleteNoteAction(id);
        console.log("deleted");
        router.refresh();
      }}
    >
      <TrashIcon className="w-4 h-4" />
    </button>
  );
};

export const SubmitButton = ({
  label = "Submit",
  className,
}: {
  label?: string;
  className?: string;
}) => {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {label}
    </button>
  );
};
