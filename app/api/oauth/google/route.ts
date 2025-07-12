import { JWT_COOKIE_NAME, signinWithOAuth } from "@/actions/auth";
import { getGoogleUser } from "@/services/oauthinit";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const user = await getGoogleUser(url);
    if (!user) {
      return NextResponse.json(
        { error: "No user can be found" },
        { status: 400 }
      );
    }
    console.log(user);
    const { token } = await signinWithOAuth({
      email: user.email,
      oauthType: "google",
    });
    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE_NAME, token);
    return NextResponse.redirect(new URL("/dashboard", url.origin));
  } catch (error) {
    console.error("Failed to get Google authorization URL:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth flow" },
      { status: 500 }
    );
  }
}
