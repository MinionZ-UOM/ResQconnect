"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { callApi } from "@/lib/api";

type FormState = {
  name: string;
  description: string;
  lat: string;
  lng: string;
  images: File[];
};

export default function DisasterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    lat: "",
    lng: "",
    images: [],
  });
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setForm((f) => ({ ...f, images: files }));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // ──────────────────────────────────────────────────
    // Client-side validation
    // ──────────────────────────────────────────────────
    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);
    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError("Latitude must be between -90 and 90.");
      setSubmitting(false);
      return;
    }
    if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError("Longitude must be between -180 and 180.");
      setSubmitting(false);
      return;
    }

    try {
      // upload images
      const uploadedUrls: string[] = [];
      for (const file of form.images) {
        const url = await uploadToFirebase(file);
        uploadedUrls.push(url);
      }

      // call backend
      await callApi("disasters", "POST", {
        name: form.name,
        description: form.description,
        location: { lat: latNum, lng: lngNum },
        image_urls: uploadedUrls,
      });

      router.push("/admin/disasters?created=1");
    } catch (err: any) {
      // try to parse Pydantic JSON error
      let msg = err.message;
      try {
        const json = JSON.parse(err.message);
        if (Array.isArray(json.detail)) {
          msg = json.detail.map((d: any) => `${d.loc.slice(-1)[0]}: ${d.msg}`).join("; ");
        }
      } catch {
        /* not JSON, swallow */
      }
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Register New Disaster</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-2xl shadow"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-primary"
            placeholder="e.g. Central Valley Flood 2025"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-primary"
            placeholder="Brief overview…"
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block mb-1 font-medium">
              Latitude
            </label>
            <input
              id="lat"
              name="lat"
              type="number"
              step="any"
              required
              min={-90}
              max={90}
              value={form.lat}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-primary"
              placeholder="36.7783"
            />
          </div>
          <div>
            <label htmlFor="lng" className="block mb-1 font-medium">
              Longitude
            </label>
            <input
              id="lng"
              name="lng"
              type="number"
              step="any"
              required
              min={-180}
              max={180}
              value={form.lng}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-primary"
              placeholder="-119.4179"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <label htmlFor="images" className="block mb-1 font-medium">
            Images (optional)
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-600
                       file:rounded-lg file:border-0 file:bg-primary
                       file:px-3 file:py-2 file:text-white"
          />
          {previews.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {previews.map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt={`preview-${i}`}
                  width={100}
                  height={100}
                  className="rounded-lg border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-100 text-red-700 px-4 py-2">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary text-white rounded-lg
                       hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

// stub for your Firebase Storage upload
async function uploadToFirebase(file: File): Promise<string> {
  // TODO: implement storage upload & return download URL
  return "";
}
