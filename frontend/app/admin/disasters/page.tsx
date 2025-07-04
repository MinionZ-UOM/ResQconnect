// app/dashboard/affected/disasters/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { callApi } from "@/lib/api";
import { imagekit } from "@/lib/imagekit";
import { Button } from "@/components/ui/button";

type Disaster = {
  id: string;
  name: string;
  description: string;
  location: { lat: number; lng: number };
  image_urls: string[];
  created_at: string;
  created_by: string;
  chat_session_id: string;
  type?: string;
  severity?: string;
  affected_count?: number;
};

type FormState = {
  name: string;
  description: string;
  lat: string;
  lng: string;
  images: File[];
  type: string;
  severity: string;
  affectedCount: string;
};

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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}

async function uploadToImageKit(file: File): Promise<string> {
  console.log("🚀 uploadToImageKit start for file:", file.name);
  let authRes;
  try {
    authRes = await fetch("/api/imagekit/auth");
  } catch (err) {
    console.error("⚠️ Failed auth call:", err);
    throw err;
  }
  if (!authRes.ok) {
    const text = await authRes.text();
    console.error("❌ Auth error body:", text);
    throw new Error(`Auth failed: ${authRes.status}`);
  }
  const authData = await authRes.json();

  let res;
  try {
    res = await imagekit.upload({
      file,
      fileName: file.name,
      folder: "/disasters",
      token: authData.token,
      signature: authData.signature,
      expire: authData.expire,
    });
  } catch (err) {
    console.error("❌ imagekit.upload threw:", err);
    throw err;
  }
  if (!res.url || typeof res.url !== "string") {
    console.error("❌ No valid URL in upload response");
    throw new Error("ImageKit upload did not return a valid URL");
  }
  return res.url;
}

export default function DisasterPage() {
  const router = useRouter();

  // State for all disasters
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);

  // State for agent-suggested disasters
  const [agentDisasters, setAgentDisasters] = useState<Disaster[]>([]);
  const [loadingAgent, setLoadingAgent] = useState(true);

  // Tab state: "all" or "agent"
  const [activeTab, setActiveTab] = useState<"all" | "agent">("all");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    lat: "",
    lng: "",
    images: [],
    type: "",
    severity: "",
    affectedCount: "",
  });
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(
    null
  );

  // Load normal disasters
  const loadDisasters = async () => {
    setLoading(true);
    try {
      const data = await callApi<Disaster[]>("disasters/", "GET");
      setDisasters(data);
    } catch (e) {
      console.error("Failed to load disasters", e);
    } finally {
      setLoading(false);
    }
  };

  // Load agent-suggested disasters
  const loadAgentDisasters = async () => {
    setLoadingAgent(true);
    try {
      const data = await callApi<Disaster[]>(
        "disasters/agent-suggested",
        "GET"
      );
      setAgentDisasters(data);
    } catch (e) {
      console.error("Failed to load agent-suggested disasters", e);
    } finally {
      setLoadingAgent(false);
    }
  };

  useEffect(() => {
    loadDisasters();
    loadAgentDisasters();
  }, []);

  // OPTIMISTIC DELETE + IGNORE EMPTY-JSON ERRORS
  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    const previous = disasters;
    setDisasters(previous.filter((d) => d.id !== id));

    try {
      await callApi(`disasters/${id}`, "DELETE");
    } catch (err: any) {
      if (err instanceof SyntaxError && /JSON/.test(err.message)) {
        console.warn("Delete returned no JSON, assuming success");
      } else {
        console.error("Delete failed, rolling back", err);
        setDisasters(previous);
      }
    }
  };

  // Approve an agent-suggested disaster
  const handleApprove = async (id: string) => {
    setConfirmApproveId(null);
    try {
      await callApi(`disasters/${id}/approve`, "POST");
      await loadAgentDisasters();
      await loadDisasters();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  // Discard an agent-suggested disaster
  const handleDiscard = async (id: string) => {
    setConfirmDiscardId(null);
    try {
      await callApi(`disasters/${id}/discard`, "DELETE");
      await loadAgentDisasters();
      await loadDisasters();
    } catch (err) {
      console.error("Discard failed", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
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

    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError("Latitude must be between -90 and 90");
      setSubmitting(false);
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError("Longitude must be between -180 and 180");
      setSubmitting(false);
      return;
    }

    // Validate affectedCount if provided
    let affectedCountNum: number | undefined = undefined;
    if (form.affectedCount) {
      const ac = parseInt(form.affectedCount, 10);
      if (isNaN(ac) || ac < 0) {
        setError("Affected count must be a non-negative integer");
        setSubmitting(false);
        return;
      }
      affectedCountNum = ac;
    }

    try {
      const image_urls = await Promise.all(
        form.images.map((file) => uploadToImageKit(file))
      );

      await callApi("disasters/", "POST", {
        name: form.name,
        description: form.description,
        location: { lat: latNum, lng: lngNum },
        image_urls,
        type: form.type,
        severity: form.severity,
        affected_count: affectedCountNum,
      });

      setShowModal(false);
      setForm({
        name: "",
        description: "",
        lat: "",
        lng: "",
        images: [],
        type: "",
        severity: "",
        affectedCount: "",
      });
      setPreviews([]);
      await loadDisasters();
      await loadAgentDisasters();
    } catch (err: any) {
      console.error("Create failed", err);
      setError(err.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      <header className="mb-6 ml-8 md:ml-0 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          Disasters
        </h1>
        <Button onClick={() => setShowModal(true)}>
          Register a New Disaster
        </Button>
      </header>

      {/* Tabs */}
      <div className="mb-8 border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-4 font-medium ${
              activeTab === "all"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All Disasters
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`py-2 px-4 font-medium ${
              activeTab === "agent"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Agent-Suggested
          </button>
        </nav>
      </div>

      {/* Content: All Disasters or Agent-Suggested */}
      {activeTab === "agent" ? (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Agent-Suggested Disasters
          </h2>
          {loadingAgent ? (
            <p>Loading agent-suggested…</p>
          ) : agentDisasters.length === 0 ? (
            <p>No agent-suggested disasters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {agentDisasters.map((d) => {
                const primaryImage = d.image_urls.find((u) => u?.trim()) || null;
                return (
                  <div
                    key={d.id}
                    className="relative flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition"
                  >
                    <div className="relative h-48 w-full">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={d.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {d.name}
                      </h3>
                      <p className="text-gray-600 mt-2 line-clamp-3">
                        {d.description}
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmApproveId(d.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConfirmDiscardId(d.id)}
                        >
                          Discard
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirm Approve Modal */}
          <Modal
            open={confirmApproveId !== null}
            onClose={() => setConfirmApproveId(null)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Confirm Approve</h3>
              <p className="mb-6">
                Are you sure you want to approve this disaster?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() =>
                    confirmApproveId && handleApprove(confirmApproveId)
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                  Yes, approve
                </button>
                <button
                  onClick={() => setConfirmApproveId(null)}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>

          {/* Confirm Discard Modal */}
          <Modal
            open={confirmDiscardId !== null}
            onClose={() => setConfirmDiscardId(null)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Confirm Discard</h3>
              <p className="mb-6">
                Are you sure you want to discard (delete) this disaster?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() =>
                    confirmDiscardId && handleDiscard(confirmDiscardId)
                  }
                  className="px-6 py-2 bg-red-600 text-white rounded-lg"
                >
                  Yes, discard
                </button>
                <button
                  onClick={() => setConfirmDiscardId(null)}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            All Disasters
          </h2>
          {loading ? (
            <p>Loading…</p>
          ) : disasters.length === 0 ? (
            <p>No disasters reported yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {disasters.map((d) => {
                const primaryImage = d.image_urls.find((u) => u?.trim()) || null;

                return (
                  <div
                    key={d.id}
                    className="relative flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition"
                  >
                    <button
                      onClick={() => setConfirmDeleteId(d.id)}
                      className="absolute top-2 right-2 z-10"
                    >
                      <Trash2 className="w-6 h-6 text-gray-500 hover:text-red-600" />
                    </button>
                    <div className="relative h-48 w-full">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={d.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {d.name}
                      </h3>
                      <p className="text-gray-600 mt-2 line-clamp-3">
                        {d.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirm Delete Modal for All Disasters */}
          <Modal
            open={confirmDeleteId !== null}
            onClose={() => setConfirmDeleteId(null)}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
              <p className="mb-6">This will permanently delete the incident.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() =>
                    confirmDeleteId && handleDelete(confirmDeleteId)
                  }
                  className="px-6 py-2 bg-red-600 text-white rounded-lg"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-6 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </section>
      )}

      {/* Create Disaster Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h3 className="text-lg font-medium mb-4">Register New Disaster</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Latitude</label>
              <input
                name="lat"
                type="number"
                step="any"
                required
                min={-90}
                max={90}
                value={form.lat}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Longitude</label>
              <input
                name="lng"
                type="number"
                step="any"
                required
                min={-180}
                max={180}
                value={form.lng}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Disaster Type</label>
              <select
                name="type"
                required
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="" disabled>
                  Select type…
                </option>
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Wildfire">Wildfire</option>
                <option value="Hurricane">Hurricane</option>
                <option value="Tornado">Tornado</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Severity</label>
              <select
                name="severity"
                required
                value={form.severity}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="" disabled>
                  Select severity…
                </option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Affected Count</label>
            <input
              name="affectedCount"
              type="number"
              min={0}
              required
              value={form.affectedCount}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Images (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="block w-full text-sm text-gray-600 file:rounded-lg file:px-3 file:py-2 file:bg-primary file:text-white"
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
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
