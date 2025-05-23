"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { callApi } from "@/lib/api";
import { Trash2 } from "lucide-react"; // proper trash icon

type Disaster = {
  id: string;
  name: string;
  description: string;
  location: { lat: number; lng: number };
  image_urls: string[];
};

type FormState = {
  name: string;
  description: string;
  lat: string;
  lng: string;
  images: File[];
};

// A minimal modal component to replace Headless UI
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose(): void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* content */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default function DisasterPage() {
  const router = useRouter();

  // list state
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);

  // modal + form state
  const [showModal, setShowModal] = useState(false);
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

  // delete-confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // fetch disasters
  const loadDisasters = async () => {
    setLoading(true);
    try {
      const data = await callApi<Disaster[]>("disasters/", "GET");
      setDisasters(data);
    } catch (e) {
      console.error("Failed to fetch disasters", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDisasters();
  }, []);

  // actual delete call
  const handleDelete = async (id: string) => {
    try {
      await callApi(`disasters/${id}`, "DELETE");
      await loadDisasters();
    } catch (e) {
      console.error("Failed to delete disaster", e);
    }
  };

  // form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setForm(f => ({ ...f, images: files }));
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

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
      const uploadedUrls: string[] = [];
      for (const file of form.images) {
        const url = await uploadToFirebase(file);
        uploadedUrls.push(url);
      }

      await callApi("disasters/", "POST", {
        name: form.name,
        description: form.description,
        location: { lat: latNum, lng: lngNum },
        image_urls: uploadedUrls,
      });

      setShowModal(false);
      setForm({ name: "", description: "", lat: "", lng: "", images: [] });
      setPreviews([]);
      await loadDisasters();
    } catch (err: any) {
      let msg = err.message;
      try {
        const json = JSON.parse(err.message);
        if (Array.isArray(json.detail)) {
          msg = json.detail
            .map((d: any) => `${d.loc.slice(-1)[0]}: ${d.msg}`)
            .join("; ");
        }
      } catch {
        // ignore
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Disasters</h1>

      {loading ? (
        <p>Loading…</p>
      ) : disasters.length === 0 ? (
        <p>No disasters reported yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {disasters.map(d => (
            <div
              key={d.id}
              className="
                relative flex flex-col h-full
                bg-white rounded-2xl shadow-lg
                overflow-hidden
                transform transition
                hover:scale-105 hover:shadow-xl
              "
            >
              {/* trash icon */}
              <button
                onClick={() => setConfirmDeleteId(d.id)}
                aria-label="Delete incident"
                className="absolute top-2 right-2 z-10"
              >
                <Trash2 className="w-6 h-6 text-gray-500 hover:text-red-600" />
              </button>

              {/* image */}
              <div className="relative h-48 w-full">
                {d.image_urls.length > 0 ? (
                  <Image
                    src={d.image_urls[0]}
                    alt={d.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full" />
                )}
              </div>

              {/* content */}
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800">
                  {d.name}
                </h2>
                <p className="text-gray-600 mt-2 line-clamp-3">
                  {d.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* centered, red report button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-red-600 text-white text-lg font-semibold rounded-2xl hover:bg-red-700 transition-transform transform hover:scale-105"
        >
          Report a New Disaster
        </button>
      </div>

      {/* create / report modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 mb-4">
            Register New Disaster
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
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
          </form>
        </div>
      </Modal>
      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
      >
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">
            Are you sure?
          </h3>
          <p className="mb-6">
            This will permanently delete the incident.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                if (confirmDeleteId) handleDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// stub for your Firebase Storage upload
async function uploadToFirebase(file: File): Promise<string> {
  // TODO: implement storage upload & return download URL
  return "";
}
