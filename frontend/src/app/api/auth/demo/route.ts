import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:8000";

const DEMO_EMAIL = "demo@adf.dev";
const DEMO_PASSWORD = "demo-adf-2024";

export async function POST() {
  try {
    let backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });

    if (backendRes.status === 401) {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
      });
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { detail: "Demo login failed" },
        { status: 500 }
      );
    }

    const user = await backendRes.json();

    const setCookie = backendRes.headers.get("set-cookie");
    const response = NextResponse.json(user);

    if (setCookie) {
      const tokenMatch = setCookie.match(/adf_token=([^;]+)/);
      if (tokenMatch) {
        response.cookies.set("adf_token", tokenMatch[1], {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 7 * 86400,
          path: "/",
        });
      }
    }

    return response;
  } catch {
    return NextResponse.json(
      { detail: "Cannot reach backend" },
      { status: 502 }
    );
  }
}
