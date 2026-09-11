import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { configured, watchIdentity } from "./service";
const Identity = createContext<{ user: User | null; online: boolean; error: string }>({
  user: null,
  online: false,
  error: "",
});
export function FriendsIdentity({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    let stop = () => {};
    if (configured) {
      try {
        stop = watchIdentity(
          (next) => {
            setUser(next);
            setError("");
          },
          (e) => setError(e.message),
        );
      } catch (e) {
        setError(String(e));
      }
    }
    return () => {
      stop();
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return <Identity.Provider value={{ user, online, error }}>{children}</Identity.Provider>;
}
export const useFriendsIdentity = () => useContext(Identity);
