import { useState, useEffect } from "react";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  registeredAt: string;
}

const STORAGE_KEY = "user_profile";

export function getUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveUser(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("user-updated"));
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("user-updated"));
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(getUser);

  useEffect(() => {
    const refresh = () => setUser(getUser());
    window.addEventListener("user-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("user-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return user;
}
