import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const isAuth = cookieStore.get("authid");
  console.log(isAuth);

  if (!isAuth) NextResponse.redirect(new URL("/signin", request.url));

  NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/",
};
