import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./actions/authFormActions";

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const isAuth = cookieStore.get("authid");
  const isJWTVerified = await verifyAccessToken(isAuth?.value);

  if (!isAuth && request.nextUrl.pathname !== "/signin")
    return NextResponse.redirect(new URL("/signin", request.url).toString());

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
