import { cookies } from "next/headers";
import crypto from "node:crypto";
import { z } from "zod";

// export async function getGitHubProfile(
//   accessToken: string,
//   tokenType: "Bearer" | "Basic" = "Bearer"
// ) {
//   const response = await fetch("https://api.github.com/user", {
//     headers: { authorization: `${tokenType} ${accessToken}` },
//   });

//   if (!response.ok) {
//     response.body?.cancel();
//     throw new Error("Failed to fetch GitHub user");
//   }

//   return response.json() as Promise<GitHubUser>;
// }

// export async function getGoogleProfile(
//   accessToken: string,
//   tokenType: "Bearer" | "Basic" = "Bearer"
// ) {
//   const response = await fetch(
//     "https://www.googleapis.com/oauth2/v2/userinfo",
//     {
//       headers: { authorization: `${tokenType} ${accessToken}` },
//     }
//   );

//   if (!response.ok) {
//     response.body?.cancel();
//     throw new Error("Failed to fetch Google user");
//   }
//   return response.json() as Promise<GoogleUser>;
// }

export interface GoogleUser {
  id: string;
  name: string;
  picture: string;
  email: string;
}

// export interface GitHubUser {
//   login: string;
//   avatar_url: string;
//   html_url: string;
//   email: string;
// }

function createState(
  cookies: Cookies,
  options?: {
    maxAgeInSeconds?: number;
  }
) {
  const state = crypto.randomBytes(64).toString("hex").normalize();
  cookies.set("state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: options?.maxAgeInSeconds ?? 60 * 10, // 10 minutes
    sameSite: "lax",
  });
  return state;
}

function validateState(cookies: Cookies, state: string) {
  const storedState = cookies.get("state");
  if (!storedState) {
    throw new Error("State not found");
  }
  return storedState.value === state;
}

function createCodeVerifier(
  cookies: Cookies,
  options?: {
    maxAgeInSeconds?: number;
  }
) {
  const codeVerifier = crypto.randomBytes(64).toString("hex").normalize();
  cookies.set("code_verifier", codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: options?.maxAgeInSeconds ?? 60 * 10, // 10 minutes
  });
  return codeVerifier;
}

function getCodeVerifier(cookies: Cookies) {
  const codeVerifier = cookies.get("code_verifier")?.value;
  if (codeVerifier == null) throw new Error("Code verifier not found");
  return codeVerifier;
}

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

export async function getCookies(): Promise<Cookies> {
  const cookieStore = await cookies();
  return {
    set: (key, value, options) => {
      cookieStore.set(key, value, options);
    },
    get: (key) => cookieStore.get(key),
    delete: (key) => cookieStore.delete(key),
  };
}

interface Provider {
  type: "github" | "google";
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUrl: string;
  urls: {
    auth: string;
    token: string;
    user: string;
  };
}
const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export abstract class OAuthProvider<T, RawData = any> implements Provider {
  protected readonly userInfo: {
    schema: z.ZodSchema<T>;
    parser: (data: T) => { id: string; email: string; name: string };
  };

  constructor(userInfo: {
    schema: z.ZodSchema<T>;
    parser: (data: T) => { id: string; email: string; name: string };
  }) {
    this.userInfo = userInfo;
  }

  parse(data: RawData) {
    const {
      data: parsedData,
      success,
      error,
    } = this.userInfo.schema.safeParse(data);
    if (!success) throw new Error(error.message);
    return parsedData;
  }

  getParser() {
    return this.userInfo.parser;
  }

  abstract type: "github" | "google";
  abstract clientId: string;
  abstract clientSecret: string;
  abstract scopes: string[];
  abstract urls: {
    auth: string;
    token: string;
    user: string;
  };
  abstract redirectUrl: string;
}

export class OAuthClient<T> {
  private readonly provider: OAuthProvider<T>;
  private readonly cookies: Cookies;
  constructor({
    provider,
    cookies,
  }: {
    provider: OAuthProvider<T>;
    cookies: Cookies;
  }) {
    this.provider = provider;
    this.cookies = cookies;
  }

  createBasicAuthUrl() {
    // const state = createState(cookies)
    // const codeVerifier = createCodeVerifier(cookies)
    const url = new URL(this.provider.urls.auth);
    url.searchParams.set("client_id", this.provider.clientId);
    url.searchParams.set("redirect_uri", this.provider.redirectUrl.toString());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.provider.scopes.join(" "));
    // url.searchParams.set("state", state)
    // url.searchParams.set("code_challenge_method", "S256")
    // url.searchParams.set(
    //   "code_challenge",
    //   crypto.hash("sha256", codeVerifier, "base64url")
    // )
    return url.toString();
  }

  createSecureAuthUrl(
    cookies: Cookies,
    options?: {
      state: {
        maxAgeInSeconds?: number;
      };
      codeVerifier: {
        maxAgeInSeconds?: number;
      };
    }
  ) {
    const state = createState(cookies, options?.state);
    const codeVerifier = createCodeVerifier(cookies, options?.codeVerifier);
    const url = new URL(this.provider.urls.auth);
    url.searchParams.set("client_id", this.provider.clientId);
    url.searchParams.set("redirect_uri", this.provider.redirectUrl.toString());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.provider.scopes.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set(
      "code_challenge",
      crypto.hash("sha256", codeVerifier, "base64url")
    );
    return url.toString();
  }

  async fetchUserWithSecurity(
    code: string,
    securityOptions?: {
      cookies?: Cookies;
      state?: string;
      useCodeVerifier?: boolean;
    }
  ) {
    if (securityOptions?.cookies && securityOptions?.state) {
      const isValidState = validateState(
        securityOptions.cookies,
        securityOptions.state
      );
      if (!isValidState) throw new Error("Invalid state");
    }

    const { accessToken, tokenType } = await this.fetchToken(
      code,
      securityOptions?.useCodeVerifier && securityOptions.cookies
        ? getCodeVerifier(securityOptions.cookies)
        : undefined
    );

    const user = await fetch(this.provider.urls.user, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((rawData) => {
        return this.provider.parse(rawData);
      });

    return this.provider.getParser()(user);
  }

  async fetchUser(code: string) {
    const { accessToken, tokenType } = await this.fetchToken(code);
    const response = await fetch(this.provider.urls.user, {
      headers: { Authorization: `${tokenType} ${accessToken}` },
    });
    const rawData = await response.json();
    console.log("raw user data", rawData);
    const user = this.provider.parse(rawData);
    return this.provider.getParser()(user);
  }

  private async fetchToken(code: string, codeVerifier?: string) {
    const searchParams = new URLSearchParams({
      code,
      redirect_uri: this.provider.redirectUrl.toString(),
      grant_type: "authorization_code",
      client_id: this.provider.clientId,
      client_secret: this.provider.clientSecret,
    });
    if (codeVerifier) {
      searchParams.set("code_verifier", codeVerifier);
    }
    return await fetch(this.provider.urls.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: searchParams,
    })
      .then((res) => res.json())
      .then((rawData) => {
        const { data, success, error } = tokenSchema.safeParse(rawData);
        if (!success) throw new Error(error.message);

        return {
          accessToken: data.access_token,
          tokenType: data.token_type,
        };
      });
  }
}

interface GitHubUser {
  id: number;
  name: string | null;
  login: string;
  email: string;
}

interface RawGithubData {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
  name: string;
  email: string;
}
export class GitHubOAuthProvider extends OAuthProvider<
  GitHubUser,
  RawGithubData
> {
  readonly type = "github";
  urls: { auth: string; token: string; user: string } = {
    auth: "https://github.com/login/oauth/authorize",
    token: "https://github.com/login/oauth/access_token",
    user: "https://api.github.com/user",
  };
  scopes = ["user:email", "read:user"];
  redirectUrl: string;
  clientId: string;
  clientSecret: string;

  constructor({
    clientId,
    clientSecret,
    redirectUrl,
    additionalScopes,
  }: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    additionalScopes?: string[];
  }) {
    const userInfo = {
      schema: z.object({
        id: z.number(),
        name: z.string().nullable(),
        login: z.string(),
        email: z.string().email(),
      }),
      parser: (user: GitHubUser) => ({
        id: user.id.toString(),
        name: user.name ?? user.login,
        email: user.email,
      }),
    };
    super(userInfo);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
    this.scopes = [...this.scopes, ...(additionalScopes ?? [])];
  }
}

export class GoogleOAuthProvider extends OAuthProvider<GoogleUser> {
  readonly type = "google";
  urls: { auth: string; token: string; user: string } = {
    auth: "https://accounts.google.com/o/oauth2/auth",
    token: "https://oauth2.googleapis.com/token",
    user: "https://www.googleapis.com/oauth2/v2/userinfo",
  };
  scopes = ["profile", "email"];
  redirectUrl: string;
  clientId: string;
  clientSecret: string;

  constructor({
    clientId,
    clientSecret,
    redirectUrl,
    additionalScopes,
  }: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    additionalScopes?: string[];
  }) {
    const userInfo = {
      schema: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        picture: z.string(),
      }),
      parser: (user: GoogleUser) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }),
    };
    super(userInfo);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
    this.scopes = [...this.scopes, ...(additionalScopes ?? [])];
  }
}
