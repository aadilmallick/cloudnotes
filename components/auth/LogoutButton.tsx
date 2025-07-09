"use client";

import { logoutAction } from "@/actions/actions";
import React from "react";

export const LogoutButton = () => {
  return (
    <button
      className="px-6 py-2 text-base bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer duration-200 font-medium shadow-sm hover:opacity-80"
      onClick={logoutAction}
    >
      Logout
    </button>
  );
};
