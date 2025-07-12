import "server-only";
import { cookies } from "next/headers";
import {
  getCookies,
  GitHubOAuthProvider,
  GoogleOAuthProvider,
  OAuthClient,
} from "./OAuth";

function validateEnv(envKey: string) {
  const env = process.env[envKey];
  if (!env) throw new Error(`Environment variable ${envKey} is not set`);
  return env;
}

const GITHUB_OAUTH_CLIENT_ID = validateEnv("GITHUB_OAUTH_CLIENT_ID");
const GITHUB_OAUTH_CLIENT_SECRET = validateEnv("GITHUB_OAUTH_CLIENT_SECRET");
const GITHUB_OAUTH_REDIRECT_URI = validateEnv("GITHUB_OAUTH_REDIRECT_URI");

const GOOGLE_OAUTH_CLIENT_ID = validateEnv("GOOGLE_OAUTH_CLIENT_ID");
const GOOGLE_OAUTH_CLIENT_SECRET = validateEnv("GOOGLE_OAUTH_CLIENT_SECRET");
const GOOGLE_OAUTH_REDIRECT_URI = validateEnv("GOOGLE_OAUTH_REDIRECT_URI");

const githubOAuthProvider = new GitHubOAuthProvider({
  clientId: GITHUB_OAUTH_CLIENT_ID,
  clientSecret: GITHUB_OAUTH_CLIENT_SECRET,
  redirectUrl: GITHUB_OAUTH_REDIRECT_URI,
});

const googleOAuthProvider = new GoogleOAuthProvider({
  clientId: GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUrl: GOOGLE_OAUTH_REDIRECT_URI,
});

export async function getGithubOAuthClient() {
  const githubOAuthClient = new OAuthClient({
    provider: githubOAuthProvider,
    cookies: await getCookies(),
  });
  return githubOAuthClient;
}

export async function getGoogleOAuthClient() {
  const googleOAuthClient = new OAuthClient({
    provider: googleOAuthProvider,
    cookies: await getCookies(),
  });
  return googleOAuthClient;
}

export async function getGithubUser(url: URL) {
  const code = url.searchParams.get("code");
  if (!code) {
    return null;
  }
  const githubOAuthClient = await getGithubOAuthClient();
  const user = await githubOAuthClient.fetchUser(code);
  return user;
}

export async function getGoogleUser(url: URL) {
  const code = url.searchParams.get("code");
  if (!code) {
    return null;
  }
  const googleOAuthClient = await getGoogleOAuthClient();
  const user = await googleOAuthClient.fetchUser(code);
  return user;
}
