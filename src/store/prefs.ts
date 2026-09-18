import { create } from "zustand";
import { persist } from "zustand/middleware";

// Lightweight client preferences (persisted): the citizen's preferred ward —
// set from the home header, used as the default ward when filing — and which
// notification groups they want to hear about.
export type NotifyKey = "status" | "cosigned" | "ward" | "reputation";

interface PrefsState {
  wardCode: string;
  setWardCode: (code: string) => void;
  /** Decisions are deliberately absent: an obligation can never be silenced. */
  notify: Record<NotifyKey, boolean>;
  toggleNotify: (key: NotifyKey) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      wardCode: "",
      setWardCode: (code) => set({ wardCode: code }),
      notify: { status: true, cosigned: true, ward: false, reputation: false },
      toggleNotify: (key) =>
        set((s) => ({ notify: { ...s.notify, [key]: !s.notify[key] } })),
    }),
    {
      name: "samadhan.prefs",
      // v1: wards moved from Mumbai codes to Agartala's W01–W51; drop a saved old one.
      version: 1,
      migrate: (saved) => ({ ...(saved as PrefsState), wardCode: "" }),
    },
  ),
);
