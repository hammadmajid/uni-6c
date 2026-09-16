"use client";

import { useState } from "react";
import { Cloud, CloudOff, KeyRound, Loader2, HardDrive } from "lucide-react";
import { useProgressStore } from "@/lib/learning/progress-store";
import { getSecret, setSecret } from "@/lib/learning/sync";

/** Small header widget: where progress lives right now, and a place to enter the sync key if the deployment needs one. */
export function SyncStatus() {
  const sync = useProgressStore((s) => s.sync);
  const hydrated = useProgressStore((s) => s.hydrated);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");

  if (!hydrated) return null;

  const view = {
    checking: { icon: Loader2, label: "checking", cls: "text-gray-600", spin: true },
    "local-only": { icon: HardDrive, label: "this browser only", cls: "text-gray-700", spin: false },
    unauthorized: { icon: KeyRound, label: "sync key needed", cls: "text-amber-600", spin: false },
    synced: { icon: Cloud, label: "synced", cls: "text-green-600", spin: false },
    saving: { icon: Loader2, label: "saving", cls: "text-gray-700", spin: true },
    error: { icon: CloudOff, label: "sync failed", cls: "text-red-600", spin: false },
  }[sync];
  const Icon = view.icon;

  return (
    <span className="relative">
      <button
        onClick={() => setOpen(!open)}
        title={
          sync === "local-only"
            ? "No DATABASE_URL configured. Progress stays in this browser."
            : sync === "unauthorized"
              ? "The deployment has a PROGRESS_SECRET. Enter it to sync."
              : "Progress sync status"
        }
        className={`text-label-12 flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-gray-100 ${view.cls}`}
      >
        <Icon size={13} className={view.spin ? "animate-spin" : ""} />
        <span className="hidden sm:inline">{view.label}</span>
      </button>
      {open && (
        <span className="animate-in fade-in zoom-in-95 absolute right-0 top-full z-50 mt-2 block w-72 rounded-lg border border-gray-500 bg-background-200 p-3.5 shadow-xl duration-150">
          <span className="text-label-12 mb-2 block text-gray-700">
            {sync === "local-only"
              ? "Progress is stored in this browser's localStorage. Set DATABASE_URL on the server to sync across machines."
              : sync === "unauthorized"
                ? "This deployment requires a sync key (PROGRESS_SECRET). Paste it once; it is remembered in this browser."
                : sync === "error"
                  ? "Could not reach the database. Changes are safe locally and will push on the next successful save."
                  : "Every change is saved to the database about a second after you make it."}
          </span>
          {sync !== "local-only" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSecret(key);
                window.location.reload();
              }}
              className="flex gap-2"
            >
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={getSecret() ? "key saved · replace" : "sync key"}
                className="text-copy-13 min-w-0 flex-1 rounded-md border border-gray-500 bg-background-100 px-2.5 py-1.5 text-gray-1000 outline-none focus:border-blue-700"
              />
              <button type="submit" className="text-label-12 rounded-md bg-gray-1000 px-2.5 py-1.5 text-black hover:bg-white">
                Save
              </button>
            </form>
          )}
        </span>
      )}
    </span>
  );
}
