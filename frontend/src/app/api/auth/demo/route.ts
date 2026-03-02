import { NextResponse } from "next/server";

export async function POST() {
  const demoUser = { id: "demo-user", email: "demo@adf.dev" };
  const response = NextResponse.json(demoUser);

  response.cookies.set("adf_token", "demo-token", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 86400,
    path: "/",
  });

  return response;
}
