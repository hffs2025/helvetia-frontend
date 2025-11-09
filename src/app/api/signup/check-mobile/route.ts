import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    CHECK_MOBILE_API_URL: process.env.CHECK_MOBILE_API_URL ?? null
  });
}
