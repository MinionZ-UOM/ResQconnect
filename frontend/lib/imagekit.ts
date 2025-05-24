// lib/imagekit.ts
import ImageKit from "imagekit-javascript"; // <-- browser SDK

const publicKey    = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
const urlEndpoint  = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const authEndpoint = "/api/imagekit/auth";

if (!publicKey || !urlEndpoint) {
  throw new Error("Missing NEXT_PUBLIC_IMAGEKIT_* env vars");
}

export const imagekit = new ImageKit({
  publicKey,
  urlEndpoint,
  authenticationEndpoint: authEndpoint,
});
