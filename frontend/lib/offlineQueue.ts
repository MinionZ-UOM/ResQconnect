// lib/offlineQueue.ts
import localforage from "localforage";

export interface QueuedRequest {
  url: string;
  method: string;
  payload: any;
  timestamp: number;
}

const STORE_KEY = "offline_observations";

localforage.config({
  name: "volunteer_reports",
  storeName: "observations_queue",
});

export async function enqueueRequest(req: QueuedRequest) {
  const queue: QueuedRequest[] = (await localforage.getItem(STORE_KEY)) || [];
  queue.push(req);
  await localforage.setItem(STORE_KEY, queue);
}

export async function getQueue(): Promise<QueuedRequest[]> {
  return (await localforage.getItem(STORE_KEY)) || [];
}

export async function clearQueue() {
  await localforage.removeItem(STORE_KEY);
}
