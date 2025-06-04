// app/api/langfuse/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  console.log("📦 Langfuse route env:", {
    USER: process.env.LANGFUSE_USERNAME,
    PASS: process.env.LANGFUSE_PASSWORD ? "SET" : undefined,
    URL: process.env.LANGFUSE_URL,
  });

  if (
    !process.env.LANGFUSE_USERNAME ||
    !process.env.LANGFUSE_PASSWORD ||
    !process.env.LANGFUSE_URL
  ) {
    console.error("❌ One of the LANGFUSE_ env vars is missing");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Build Basic Auth header
  const credentials = `${process.env.LANGFUSE_USERNAME}:${process.env.LANGFUSE_PASSWORD}`;
  const basicAuth = Buffer.from(credentials).toString("base64");

  try {
    const response = await axios.request({
      method: "GET",
      url: process.env.LANGFUSE_URL,
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    });

    // Return exactly whatever Langfuse sent back
    return NextResponse.json(response.data);
  } catch (err) {
    console.error("❌ Error fetching from Langfuse:", err);
    return NextResponse.json({ error: "Failed to fetch from Langfuse" }, { status: 500 });
  }
}
