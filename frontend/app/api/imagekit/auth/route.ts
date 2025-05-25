import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export async function GET() {
  console.log("📦 Auth route env:", {
    PUBLIC: process.env.IMAGEKIT_PUBLIC_KEY,
    PRIVATE: process.env.IMAGEKIT_PRIVATE_KEY ? "SET" : undefined,
    URL: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error("❌ One of the IMAGEKIT_ env vars is missing");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const ik = new ImageKit({
    publicKey:  process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  const authParams = ik.getAuthenticationParameters();
  return NextResponse.json(authParams);
}
