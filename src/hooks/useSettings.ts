import { useState, useEffect, useCallback } from "react";

export interface AppSettings {
  autoplay: boolean;
  notifications: boolean;
  darkMode: boolean;
  backgroundPlay: boolean;
  subtitles: boolean;
  dataSaver: boolean;
  pipMode: boolean;
  screenLock: boolean;
  history: boolean;
  parentalControl: boolean;
  autoSkipIntro: boolean;
  videoQuality: string;
  language: string;
  playbackSpeed: string;
}

const DEFAULTS: AppSettings = {
  autoplay: true,
  notifications: true,
  darkMode: true,
  backgroundPlay: false,
  subtitles: true,
  dataSaver: false,
  pipMode: true,
  screenLock: true,
  history: true,
  parentalControl: false,
  autoSkipIntro: true,
  videoQuality: "Auto",
  language: "English",
  playbackSpeed: "1x",
};

const KEY = "app_settings";
const EVT = "app-settings-updated";

function read(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return DEFAULTS;
  }
}

function write(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return read()[key];
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(read);

  useEffect(() => {
    const refresh = () => setSettings(read());
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...read(), [key]: value };
    write(next);
    setSettings(next);
    // Side effects
    if (key === "darkMode") {
      if (value) {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  return { settings, update };
}
