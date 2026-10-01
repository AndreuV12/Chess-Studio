import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

const publicPagePaths = ["/login", "/register"];
const publicApiPaths = ["/api/auth", "/api/login", "/api/register"];

export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = Boolean(request.auth?.user);
  const isPublicPage = publicPagePaths.includes(pathname);
  const isPublicApi = publicApiPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isPublicApi) return NextResponse.next();

  if (isPublicPage) {
    return isAuthenticated ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (isAuthenticated) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wasm|js)$).*)"],
};
