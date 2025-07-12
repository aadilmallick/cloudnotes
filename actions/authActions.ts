"use server";

import {
  getGithubOAuthClient,
  getGoogleOAuthClient,
} from "@/services/oauthinit";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const githubOAuthClient = await getGithubOAuthClient();
  const url = githubOAuthClient.createBasicAuthUrl();
  redirect(url);
}

export async function signInWithGoogle() {
  const googleOAuthClient = await getGoogleOAuthClient();
  const url = googleOAuthClient.createBasicAuthUrl();
  redirect(url);
}
