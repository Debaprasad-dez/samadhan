import { create } from "zustand";
import { persist } from "zustand/middleware";

// Lightweight client preferences (persisted). Currently the citizen's preferred
// ward — set from the home header, used as the default ward when filing.
interface PrefsState {
  wardCode: string;
  setWardCode: (code: string) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      wardCode: "",
      setWardCode: (code) => set({ wardCode: code }),
    }),
    { name: "samadhan.prefs" },
  ),
);
