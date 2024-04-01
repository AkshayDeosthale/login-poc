import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./actions/authFormActions";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const isAuth = cookieStore.get("authid");
  const isJWTVerified = await verifyAccessToken(isAuth?.value);
  console.log(!isJWTVerified?.success)
  if (!isAuth || !isJWTVerified?.success)
    NextResponse.redirect(new URL("/signin", request.url));

  NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
